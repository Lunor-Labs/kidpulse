import { randomUUID } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { env } from '../config/env';
import type { ImageUploadInput } from '../types/adminSchemas';
import type { ImageUploadResult } from '../types/dto';

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function getS3Client(): S3Client {
  return new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

export class UploadService {
  async uploadImage(input: ImageUploadInput): Promise<ImageUploadResult> {
    const ext = EXT_BY_MIME[input.contentType.toLowerCase()] ?? 'bin';
    const path = `${input.folder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

    let buffer: Buffer;
    try {
      buffer = Buffer.from(input.dataBase64, 'base64');
    } catch {
      throw new AppError('Invalid image data', 400);
    }

    if (buffer.length === 0) throw new AppError('Empty image data', 400);

    const client = getS3Client();

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: path,
          Body: buffer,
          ContentType: input.contentType,
        })
      );
    } catch (error) {
      logger.error({ error, path }, 'S3 upload failed');
      throw new AppError('Unable to upload image', 500);
    }

    const url = `${env.S3_PUBLIC_URL.replace(/\/+$/, '')}/${path}`;
    return { url, path };
  }
}