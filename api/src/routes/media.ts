import { Router, Request, Response } from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export const mediaRouter = Router();

const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

mediaRouter.get('/*', async (req: Request, res: Response) => {
  const key = (req.params as any)[0] as string;
  if (!key) return res.status(400).json({ error: 'Missing key' });

  try {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });
    const object = await s3.send(command);
    const contentType = object.ContentType ?? 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Allow any origin to display this image (Vercel frontend → VPS backend).
    // Without this, browsers enforce CORP and block cross-origin <img> renders.
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    (object.Body as any).pipe(res);
  } catch (err: any) {
    if (err.name === 'NoSuchKey') return res.status(404).json({ error: 'Not found' });
    return res.status(500).json({ error: 'Failed to fetch media' });
  }
});