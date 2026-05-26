export function getAssetUrl(path: string) {
  if (/^https?:\/\//.test(path) || path.startsWith('/')) {
    return path;
  }

  return `/${path}`;
}
