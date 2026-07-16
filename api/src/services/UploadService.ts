import { randomUUID } from 'node:crypto';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { getSupabaseAdmin } from '../lib/supabaseAdmin';
import { ImageUploadInput } from '../types/adminSchemas';
import { ImageUploadResult } from '../types/dto';

const BUCKET = 'kidpulse-media';

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

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

    const client = getSupabaseAdmin();
    const { error } = await client.storage.from(BUCKET).upload(path, buffer, {
      contentType: input.contentType,
      upsert: false,
    });
    if (error) {
      logger.error({ error, path }, 'Supabase upload failed');
      throw new AppError('Unable to upload image', 500);
    }
    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
  }
}
