const maxSourceImageSize = 8 * 1024 * 1024;
const maxAvatarUploadSize = 700 * 1024;

export async function prepareAvatarFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > maxSourceImageSize) {
    throw new Error('Please choose an image smaller than 8 MB.');
  }

  if (file.size <= maxAvatarUploadSize) {
    return file;
  }

  const compressedBlob = await compressAvatar(file);

  if (compressedBlob.size > maxAvatarUploadSize) {
    throw new Error('Please choose a simpler or smaller image.');
  }

  return new File([compressedBlob], 'avatar.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

function compressAvatar(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);

    image.addEventListener('load', async () => {
      URL.revokeObjectURL(imageUrl);

      try {
        const attempts = [
          { size: 512, quality: 0.82 },
          { size: 384, quality: 0.76 },
          { size: 256, quality: 0.7 },
          { size: 180, quality: 0.64 },
        ];

        for (const attempt of attempts) {
          const blob = await drawAvatar(image, attempt.size, attempt.quality);

          if (blob.size <= maxAvatarUploadSize) {
            resolve(blob);
            return;
          }
        }

        reject(new Error('Please choose a simpler or smaller image.'));
      } catch (error) {
        reject(error);
      }
    });

    image.addEventListener('error', () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Could not read this image.'));
    });

    image.src = imageUrl;
  });
}

function drawAvatar(image: HTMLImageElement, outputSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - sourceSize) / 2;
    const sourceY = (image.naturalHeight - sourceSize) / 2;

    if (!context) {
      reject(new Error('Could not prepare avatar.'));
      return;
    }

    canvas.width = outputSize;
    canvas.height = outputSize;
    context.fillStyle = '#222226';
    context.fillRect(0, 0, outputSize, outputSize);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      outputSize,
      outputSize,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not compress this image.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}
