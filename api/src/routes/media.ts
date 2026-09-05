import { Router, Request, Response } from 'express';
import { Readable } from 'node:stream';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { logger } from '../lib/logger';

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

// Allow any origin to display these bytes (Vercel frontend -> VPS backend).
// helmet() defaults Cross-Origin-Resource-Policy to same-origin, under which a
// browser blocks the cross-origin <img> render. Set on every response, error
// paths included, so a 404 is reported to the page rather than swallowed as an
// opaque CORP failure that looks identical to a broken image.
mediaRouter.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

mediaRouter.get('/*', async (req: Request, res: Response) => {
  const key = (req.params as any)[0] as string;
  if (!key) return res.status(400).json({ error: 'Missing key' });

  try {
    const object = await s3.send(
      new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      })
    );

    res.setHeader('Content-Type', object.ContentType ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Content-Length lets the Next image optimizer and any CDN in front of it
    // size the response instead of buffering a chunked stream of unknown length.
    if (object.ContentLength !== undefined) {
      res.setHeader('Content-Length', String(object.ContentLength));
    }
    if (object.ETag) res.setHeader('ETag', object.ETag);

    const stream = object.Body as Readable;
    // Without this the process takes an unhandled 'error' on a mid-transfer S3
    // failure. Headers are already sent by then, so the only correct move is to
    // destroy the socket and let the client retry.
    stream.on('error', (error) => {
      logger.error({ error, key }, 'Media stream failed');
      res.destroy();
    });
    stream.pipe(res);
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ error: 'Not found' });
    }
    logger.error({ err, key }, 'Failed to fetch media');
    return res.status(500).json({ error: 'Failed to fetch media' });
  }
});
