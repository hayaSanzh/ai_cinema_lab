import { createReadStream, createWriteStream } from 'node:fs';
import { cp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';
import { createGzip } from 'node:zlib';
import sharp from 'sharp';

const rootDir = new URL('..', import.meta.url).pathname;
const publicDir = join(rootDir, 'public');
const distDir = join(rootDir, 'dist');
const reportPath = join(distDir, 'build-report.json');
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.map',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml',
]);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png']);
const criticalImagePatterns = [
  /assets\/img\/logo\//,
  /assets\/img\/favicon/i,
  /assets\/img\/hero\/color-bg/i,
  /assets\/img\/home-6\/hero/i,
];

const report = {
  generatedAt: new Date().toISOString(),
  imagesConverted: [],
  imagesSkipped: [],
  htmlFilesUpdated: 0,
  gzipFilesCreated: 0,
};
const webpCache = new Map();

await rm(distDir, { recursive: true, force: true });
await cp(publicDir, distDir, { recursive: true });

const files = await listFiles(distDir);
const htmlFiles = files.filter((file) => extname(file).toLowerCase() === '.html');

for (const htmlFile of htmlFiles) {
  await optimizeHtmlFile(htmlFile);
}

const distFiles = await listFiles(distDir);

for (const file of distFiles) {
  if (textExtensions.has(extname(file).toLowerCase())) {
    await gzipFile(file);
    report.gzipFilesCreated += 1;
  }
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`Built static frontend: ${relative(process.cwd(), distDir)}`);
console.log(`HTML files updated: ${report.htmlFilesUpdated}`);
console.log(`Images converted to WebP: ${report.imagesConverted.length}`);
console.log(`Gzip files created: ${report.gzipFilesCreated}`);
console.log(`Report: ${relative(process.cwd(), reportPath)}`);

async function optimizeHtmlFile(filePath) {
  const originalHtml = await readFile(filePath, 'utf8');
  let html = originalHtml;

  html = await optimizeImageTags(html, filePath);
  html = optimizeIframeTags(html);

  if (html !== originalHtml) {
    await writeFile(filePath, html);
    report.htmlFilesUpdated += 1;
  }
}

async function optimizeImageTags(html, htmlFilePath) {
  const imgTagPattern = /<img\b[^>]*>/gi;
  const replacements = [];

  for (const match of html.matchAll(imgTagPattern)) {
    const tag = match[0];
    const src = getAttribute(tag, 'src');

    if (!src || isExternalUrl(src) || src.startsWith('data:')) {
      continue;
    }

    const normalizedSrc = normalizeUrlPath(src);
    const sourcePath = join(dirname(htmlFilePath), normalizedSrc);
    const sourceExists = await fileExists(sourcePath);
    let nextTag = tag;

    if (sourceExists) {
      const metadata = await getImageMetadata(sourcePath);

      if (metadata.width && metadata.height) {
        nextTag = setAttributeIfMissing(nextTag, 'width', String(metadata.width));
        nextTag = setAttributeIfMissing(nextTag, 'height', String(metadata.height));
      }

      if (!isCriticalImage(normalizedSrc)) {
        nextTag = setAttributeIfMissing(nextTag, 'loading', 'lazy');
      }

      nextTag = setAttributeIfMissing(nextTag, 'decoding', 'async');

      const webpSrc = await createWebpIfUseful(sourcePath, normalizedSrc);

      if (webpSrc) {
        nextTag = setAttribute(nextTag, 'src', webpSrc);
      }
    }

    if (nextTag !== tag) {
      replacements.push([tag, nextTag]);
    }
  }

  return replacements.reduce((nextHtml, [from, to]) => nextHtml.replace(from, to), html);
}

function optimizeIframeTags(html) {
  return html.replace(/<iframe\b[^>]*>/gi, (tag) => {
    let nextTag = setAttributeIfMissing(tag, 'loading', 'lazy');

    nextTag = setAttributeIfMissing(nextTag, 'referrerpolicy', 'strict-origin-when-cross-origin');

    return nextTag;
  });
}

async function createWebpIfUseful(sourcePath, normalizedSrc) {
  const extension = extname(sourcePath).toLowerCase();

  if (!imageExtensions.has(extension)) {
    return null;
  }

  if (webpCache.has(sourcePath)) {
    return webpCache.get(sourcePath);
  }

  const outputPath = sourcePath.replace(/\.(jpe?g|png)$/i, '.webp');
  const outputSrc = normalizedSrc.replace(/\.(jpe?g|png)$/i, '.webp');

  try {
    await sharp(sourcePath).rotate().webp({ effort: 4, quality: 78 }).toFile(outputPath);

    const [sourceSize, outputSize] = await Promise.all([stat(sourcePath), stat(outputPath)]);

    if (outputSize.size >= sourceSize.size) {
      await rm(outputPath, { force: true });
      report.imagesSkipped.push({
        src: normalizedSrc,
        reason: 'webp-not-smaller',
        originalBytes: sourceSize.size,
        webpBytes: outputSize.size,
      });
      webpCache.set(sourcePath, null);

      return null;
    }

    report.imagesConverted.push({
      src: normalizedSrc,
      webp: outputSrc,
      originalBytes: sourceSize.size,
      webpBytes: outputSize.size,
      savedBytes: sourceSize.size - outputSize.size,
    });
    webpCache.set(sourcePath, outputSrc);

    return outputSrc;
  } catch (error) {
    report.imagesSkipped.push({
      src: normalizedSrc,
      reason: error instanceof Error ? error.message : 'unknown-error',
    });
    webpCache.set(sourcePath, null);

    return null;
  }
}

async function getImageMetadata(filePath) {
  try {
    return await sharp(filePath).metadata();
  } catch (error) {
    return {};
  }
}

async function gzipFile(filePath) {
  await new Promise((resolve, reject) => {
    const input = createReadStream(filePath);
    const output = createWriteStream(`${filePath}.gz`);
    const gzip = createGzip({ level: 9 });

    input.on('error', reject);
    output.on('error', reject);
    output.on('finish', resolve);
    input.pipe(gzip).pipe(output);
  });
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function fileExists(filePath) {
  try {
    await stat(filePath);

    return true;
  } catch (error) {
    return false;
  }
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'i'));

  return match ? match[2] : null;
}

function setAttributeIfMissing(tag, name, value) {
  return getAttribute(tag, name) === null ? setAttribute(tag, name, value) : tag;
}

function setAttribute(tag, name, value) {
  const safeValue = escapeAttribute(value);
  const attributePattern = new RegExp(`(\\s${name}=)(["']).*?\\2`, 'i');

  if (attributePattern.test(tag)) {
    return tag.replace(attributePattern, `$1"${safeValue}"`);
  }

  return tag.replace(/>$/, ` ${name}="${safeValue}">`);
}

function isExternalUrl(value) {
  return /^(https?:)?\/\//i.test(value);
}

function normalizeUrlPath(value) {
  return value.split('#')[0].split('?')[0].replaceAll('/', sep);
}

function isCriticalImage(src) {
  return criticalImagePatterns.some((pattern) => pattern.test(src.replaceAll(sep, '/')));
}

function escapeAttribute(value) {
  return String(value).replace(/"/g, '&quot;');
}
