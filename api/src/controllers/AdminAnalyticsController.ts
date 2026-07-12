import { NextFunction, Request, Response } from 'express';
import { AdminAnalyticsService } from '../services/AdminAnalyticsService';

function parseRangeQuery(req: Request): { from?: string; to?: string } {
  return {
    from: typeof req.query.from === 'string' ? req.query.from : undefined,
    to: typeof req.query.to === 'string' ? req.query.to : undefined,
  };
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'number' ? String(v) : String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRows(header: string[], rows: unknown[][]): string {
  const lines = [header.map(csvCell).join(',')];
  for (const row of rows) lines.push(row.map(csvCell).join(','));
  return lines.join('\r\n') + '\r\n';
}

function sendCsv(res: Response, filename: string, body: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(body);
}

export class AdminAnalyticsController {
  constructor(private service = new AdminAnalyticsService()) {}

  sales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.sales(parseRangeQuery(req));
      res.json({ data: report });
    } catch (error) {
      next(error);
    }
  };

  salesCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.sales(parseRangeQuery(req));
      const body = csvRows(
        ['date', 'revenue', 'orders'],
        report.series.map((p) => [p.date, p.revenue.toFixed(2), p.orderCount])
      );
      sendCsv(res, `sales_${report.from.slice(0, 10)}_${report.to.slice(0, 10)}.csv`, body);
    } catch (error) {
      next(error);
    }
  };

  bestSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sortParam = req.query.sort === 'revenue' ? 'revenue' : 'units';
      const report = await this.service.bestSellers({
        ...parseRangeQuery(req),
        categoryId:
          typeof req.query.categoryId === 'string' && req.query.categoryId
            ? req.query.categoryId
            : undefined,
        sort: sortParam,
        limit:
          typeof req.query.limit === 'string'
            ? Number.parseInt(req.query.limit, 10)
            : undefined,
      });
      res.json({ data: report });
    } catch (error) {
      next(error);
    }
  };

  bestSellersCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sortParam = req.query.sort === 'revenue' ? 'revenue' : 'units';
      const report = await this.service.bestSellers({
        ...parseRangeQuery(req),
        categoryId:
          typeof req.query.categoryId === 'string' && req.query.categoryId
            ? req.query.categoryId
            : undefined,
        sort: sortParam,
        limit: 500,
      });
      const body = csvRows(
        ['product', 'slug', 'category', 'unitsSold', 'revenue', 'orders'],
        report.rows.map((r) => [
          r.name,
          r.slug,
          r.categoryName,
          r.unitsSold,
          r.revenue.toFixed(2),
          r.orderCount,
        ])
      );
      sendCsv(
        res,
        `bestsellers_${report.from.slice(0, 10)}_${report.to.slice(0, 10)}.csv`,
        body
      );
    } catch (error) {
      next(error);
    }
  };

  customers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.customers(parseRangeQuery(req));
      res.json({ data: report });
    } catch (error) {
      next(error);
    }
  };

  customersCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.customers(parseRangeQuery(req));
      const body = csvRows(
        ['userId', 'email', 'fullName', 'orderCount', 'totalSpent'],
        report.topCustomers.map((c) => [
          c.userId,
          c.email,
          c.fullName ?? '',
          c.orderCount,
          c.totalSpent.toFixed(2),
        ])
      );
      sendCsv(
        res,
        `top_customers_${report.from.slice(0, 10)}_${report.to.slice(0, 10)}.csv`,
        body
      );
    } catch (error) {
      next(error);
    }
  };
}
