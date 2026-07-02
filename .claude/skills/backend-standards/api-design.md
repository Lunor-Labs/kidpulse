# API Design Standards

## URL Conventions

```
/api/v1/resources              GET (list), POST (create)
/api/v1/resources/:id          GET (single), PATCH (update), DELETE
/api/v1/resources/:id/sub      Nested resources

# Good
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
GET    /api/v1/products/:id/reviews

# Bad — verbs in URLs
POST /api/v1/getProducts       ❌
POST /api/v1/products/create   ❌
```

**Rules:**
- Plural nouns for collections
- kebab-case for multi-word: `/api/v1/order-items`
- Version prefix always: `/api/v1/`
- Use query params for filtering/sorting: `?status=active&sort=createdAt&order=desc`

## Standard Response Envelope

```ts
// Success — single resource
{ "data": { "id": "...", "name": "..." } }

// Success — collection
{
  "data": [...],
  "meta": { "total": 100, "page": 1, "pageSize": 20, "pageCount": 5 }
}

// Error
{ "error": "Product not found", "code": "PRODUCT_NOT_FOUND" }

// Validation error
{
  "error": "Validation failed",
  "details": [{ "field": "price", "message": "Must be a positive number" }]
}
```

Never return raw arrays at the top level — always wrap in `{ data: [...] }`.

## Request Validation with Zod

```ts
// src/types/product.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  description: z.string().max(2000).optional(),
  categoryId: z.string().cuid(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// src/middleware/validate.ts
import { AnyZodObject, ZodError } from 'zod';

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
      }
      next(error);
    }
  };
}
```

**Rules:**
- Every POST/PATCH route uses `validate()` middleware
- Validate at the boundary — never trust `req.body` in controllers
- Use `z.infer<typeof schema>` for TypeScript types (single source of truth)
- Validate query params too: `schema.parse(req.query)` in middleware

## Pagination

```ts
// Offset-based pagination (simple, good for admin UIs)
GET /api/v1/products?page=2&pageSize=20

// Cursor-based pagination (better for large datasets / infinite scroll)
GET /api/v1/products?cursor=cld3x2y&pageSize=20

// Response with offset pagination
{
  "data": [...],
  "meta": {
    "total": 847,
    "page": 2,
    "pageSize": 20,
    "pageCount": 43,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}

// Prisma offset pagination
const [data, total] = await prisma.$transaction([
  prisma.product.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
  prisma.product.count(),
]);

// Prisma cursor pagination
const data = await prisma.product.findMany({
  take: pageSize,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

**Default:** `pageSize` max 100, default 20. Reject requests over 100.

## HTTP Status Codes

| Code | When |
|---|---|
| `200 OK` | Successful GET, PATCH |
| `201 Created` | Successful POST (return created resource) |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Validation error, malformed request |
| `401 Unauthorized` | Missing or invalid auth token |
| `403 Forbidden` | Authenticated but not authorized |
| `404 Not Found` | Resource doesn't exist |
| `409 Conflict` | Duplicate entry, state conflict |
| `422 Unprocessable Entity` | Business rule violation |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected error (never expose details) |

## OpenAPI Documentation

```ts
// Install: npm install swagger-ui-express swagger-jsdoc @types/swagger-jsdoc

// src/lib/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
});

// Route annotation example
/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Product list
 */
```

Expose docs at `/api/docs` in non-production environments only.
