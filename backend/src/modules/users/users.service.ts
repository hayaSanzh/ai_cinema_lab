import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { buildAvatarUrl } from '../../common/avatar-url';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export type PublicProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AvatarUploadFile = {
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<PublicProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User was not found.');
    }

    return this.toPublicProfile(user);
  }

  async updateMe(userId: string, dto: UpdateProfileDto): Promise<PublicProfile> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
      },
    });

    return this.toPublicProfile(user);
  }

  async updateAvatar(userId: string, file: AvatarUploadFile): Promise<PublicProfile> {
    const avatarExtension = getAvatarExtension(file);

    if (!avatarExtension) {
      throw new BadRequestException('Avatar must be a PNG, JPG, WEBP or GIF image.');
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException('User was not found.');
    }

    const avatarUploadsRoot = getAvatarUploadsRoot();

    await mkdir(avatarUploadsRoot, { recursive: true });

    const filename = `${userId}-${Date.now()}-${randomBytes(8).toString('hex')}${avatarExtension}`;
    const avatarPath = `/uploads/avatars/${filename}`;
    const absolutePath = join(avatarUploadsRoot, filename);

    await writeFile(absolutePath, file.buffer);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarPath },
    });

    await removeOldAvatar(currentUser.avatarPath);

    return this.toPublicProfile(user);
  }

  private toPublicProfile(user: {
    id: string;
    name: string;
    email: string;
    avatarPath: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PublicProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: buildAvatarUrl(user.avatarPath),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

function getAvatarExtension(file: AvatarUploadFile): string | null {
  const detectedExtension = getExtensionFromMagicBytes(file.buffer);

  if (!detectedExtension) {
    return null;
  }

  const uploadedExtension = extname(file.originalname).toLowerCase();

  if (uploadedExtension === '.jpg' || uploadedExtension === '.jpeg') {
    return detectedExtension === '.jpg' ? uploadedExtension : detectedExtension;
  }

  return detectedExtension;
}

function getExtensionFromMagicBytes(buffer: Buffer): string | null {
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
    return '.png';
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return '.jpg';
  }

  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF89a')
  ) {
    return '.gif';
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return '.webp';
  }

  return null;
}

async function removeOldAvatar(avatarPath: string | null): Promise<void> {
  if (!avatarPath || !avatarPath.startsWith('/uploads/avatars/')) {
    return;
  }

  try {
    await unlink(join(getUploadsRoot(), avatarPath.replace(/^\/uploads\//, '')));
  } catch {
    // Missing old avatar files should not block saving a new profile image.
  }
}

function getUploadsRoot(): string {
  return resolve(process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads'));
}

function getAvatarUploadsRoot(): string {
  return join(getUploadsRoot(), 'avatars');
}
