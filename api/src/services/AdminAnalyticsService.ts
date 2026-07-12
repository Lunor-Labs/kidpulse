import { prisma } from '../lib/prisma';

const EXCLUDED_ORDER_STATUSES = ['CANCELLED', 'FAILED'];

export interface SalesReportPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface PaymentMethodBreakdown {
  paymentMethod: string;
  orderCount: number;
  revenue: number;
}

export interface StatusBreakdown {
  status: string;
  orderCount: number;
}

export interface SalesReportDto {
  from: string;
  to: string;
  totals: {
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
    cancelledCount: number;
    failedCount: number;
  };
  series: SalesReportPoint[];
  paymentBreakdown: PaymentMethodBreakdown[];
  statusBreakdown: StatusBreakdown[];
}

export interface BestSellerRow {
  productId: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
}

export interface BestSellersReportDto {
  from: string;
  to: string;
  categoryId: string | null;
  sort: 'units' | 'revenue';
  rows: BestSellerRow[];
}

export interface SignupPoint {
  date: string;
  count: number;
}

export interface TopCustomerRow {
  userId: string;
  email: string;
  fullName: string | null;
  orderCount: number;
  totalSpent: number;
}

export interface WishlistTrendRow {
  productId: string;
  name: string;
  slug: string;
  wishlistCount: number;
}

export interface CustomerActivityReportDto {
  from: string;
  to: string;
  totals: {
    newCustomers: number;
    orderingCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
  };
  signups: SignupPoint[];
  topCustomers: TopCustomerRow[];
  wishlistTop: WishlistTrendRow[];
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

function parseRange(filter: DateRangeFilter): { from: Date; to: Date } {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  defaultFrom.setUTCHours(0, 0, 0, 0);

  const from = filter.from ? new Date(filter.from) : defaultFrom;
  from.setUTCHours(0, 0, 0, 0);

  const to = filter.to ? new Date(filter.to) : now;
  to.setUTCHours(23, 59, 59, 999);

  return { from, to };
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function enumerateDays(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setUTCHours(0, 0, 0, 0);
  while (cursor.getTime() <= end.getTime()) {
    out.push(dayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export class AdminAnalyticsService {
  async sales(filter: DateRangeFilter): Promise<SalesReportDto> {
    const { from, to } = parseRange(filter);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: {
        status: true,
        paymentMethod: true,
        total: true,
        createdAt: true,
      },
    });

    const days = enumerateDays(from, to);
    const seriesMap = new Map<string, { revenue: number; orderCount: number }>();
    for (const d of days) seriesMap.set(d, { revenue: 0, orderCount: 0 });

    const paymentMap = new Map<string, { orderCount: number; revenue: number }>();
    const statusMap = new Map<string, number>();

    let revenue = 0;
    let orderCount = 0;
    let cancelledCount = 0;
    let failedCount = 0;

    for (const o of orders) {
      statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
      if (o.status === 'CANCELLED') cancelledCount++;
      if (o.status === 'FAILED') failedCount++;
      if (EXCLUDED_ORDER_STATUSES.includes(o.status)) continue;

      const total = Number(o.total);
      revenue += total;
      orderCount++;

      const key = dayKey(o.createdAt);
      const bucket = seriesMap.get(key);
      if (bucket) {
        bucket.revenue += total;
        bucket.orderCount += 1;
      }

      const pm = paymentMap.get(o.paymentMethod) ?? { orderCount: 0, revenue: 0 };
      pm.orderCount += 1;
      pm.revenue += total;
      paymentMap.set(o.paymentMethod, pm);
    }

    const series: SalesReportPoint[] = days.map((d) => ({
      date: d,
      revenue: seriesMap.get(d)?.revenue ?? 0,
      orderCount: seriesMap.get(d)?.orderCount ?? 0,
    }));

    const paymentBreakdown: PaymentMethodBreakdown[] = [...paymentMap.entries()]
      .map(([paymentMethod, v]) => ({
        paymentMethod,
        orderCount: v.orderCount,
        revenue: v.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const statusBreakdown: StatusBreakdown[] = [...statusMap.entries()]
      .map(([status, count]) => ({ status, orderCount: count }))
      .sort((a, b) => b.orderCount - a.orderCount);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totals: {
        revenue,
        orderCount,
        averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        cancelledCount,
        failedCount,
      },
      series,
      paymentBreakdown,
      statusBreakdown,
    };
  }

  async bestSellers(
    filter: DateRangeFilter & {
      categoryId?: string;
      sort?: 'units' | 'revenue';
      limit?: number;
    }
  ): Promise<BestSellersReportDto> {
    const { from, to } = parseRange(filter);
    const limit = Math.min(Math.max(filter.limit ?? 50, 1), 500);
    const sort = filter.sort === 'revenue' ? 'revenue' : 'units';

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: from, lte: to },
          status: { notIn: EXCLUDED_ORDER_STATUSES },
        },
        ...(filter.categoryId ? { product: { categoryId: filter.categoryId } } : {}),
      },
      select: {
        productId: true,
        quantity: true,
        lineTotal: true,
        orderId: true,
        product: {
          select: {
            name: true,
            slug: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    const rowMap = new Map<
      string,
      {
        productId: string;
        name: string;
        slug: string;
        categoryId: string;
        categoryName: string;
        unitsSold: number;
        revenue: number;
        orders: Set<string>;
      }
    >();

    for (const item of orderItems) {
      const bucket =
        rowMap.get(item.productId) ??
        {
          productId: item.productId,
          name: item.product.name,
          slug: item.product.slug,
          categoryId: item.product.categoryId,
          categoryName: item.product.category.name,
          unitsSold: 0,
          revenue: 0,
          orders: new Set<string>(),
        };
      bucket.unitsSold += item.quantity;
      bucket.revenue += Number(item.lineTotal);
      bucket.orders.add(item.orderId);
      rowMap.set(item.productId, bucket);
    }

    const rows: BestSellerRow[] = [...rowMap.values()]
      .map((b) => ({
        productId: b.productId,
        name: b.name,
        slug: b.slug,
        categoryId: b.categoryId,
        categoryName: b.categoryName,
        unitsSold: b.unitsSold,
        revenue: b.revenue,
        orderCount: b.orders.size,
      }))
      .sort((a, b) =>
        sort === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold
      )
      .slice(0, limit);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      categoryId: filter.categoryId ?? null,
      sort,
      rows,
    };
  }

  async customers(filter: DateRangeFilter): Promise<CustomerActivityReportDto> {
    const { from, to } = parseRange(filter);

    const [signups, orders, wishlistTop] = await Promise.all([
      prisma.userProfile.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: { createdAt: true },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: from, lte: to },
          status: { notIn: EXCLUDED_ORDER_STATUSES },
        },
        select: {
          userId: true,
          total: true,
          user: { select: { email: true, fullName: true } },
        },
      }),
      prisma.wishlistItem.groupBy({
        by: ['productId'],
        _count: { _all: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 10,
      }),
    ]);

    const days = enumerateDays(from, to);
    const signupMap = new Map<string, number>();
    for (const d of days) signupMap.set(d, 0);
    for (const s of signups) {
      const k = dayKey(s.createdAt);
      if (signupMap.has(k)) signupMap.set(k, (signupMap.get(k) ?? 0) + 1);
    }
    const signupSeries: SignupPoint[] = days.map((d) => ({
      date: d,
      count: signupMap.get(d) ?? 0,
    }));

    const customerMap = new Map<
      string,
      {
        userId: string;
        email: string;
        fullName: string | null;
        orderCount: number;
        totalSpent: number;
      }
    >();
    for (const o of orders) {
      const bucket = customerMap.get(o.userId) ?? {
        userId: o.userId,
        email: o.user.email,
        fullName: o.user.fullName,
        orderCount: 0,
        totalSpent: 0,
      };
      bucket.orderCount += 1;
      bucket.totalSpent += Number(o.total);
      customerMap.set(o.userId, bucket);
    }
    const customerList = [...customerMap.values()];
    const orderingCustomers = customerList.length;
    const repeatCustomers = customerList.filter((c) => c.orderCount > 1).length;
    const repeatRate = orderingCustomers > 0 ? repeatCustomers / orderingCustomers : 0;

    const topCustomers = customerList
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const productIds = wishlistTop.map((w) => w.productId);
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, slug: true },
        })
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));
    const wishlistRows: WishlistTrendRow[] = wishlistTop
      .map((w) => {
        const p = productMap.get(w.productId);
        return p
          ? {
              productId: p.id,
              name: p.name,
              slug: p.slug,
              wishlistCount: w._count._all,
            }
          : null;
      })
      .filter((r): r is WishlistTrendRow => r !== null);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totals: {
        newCustomers: signups.length,
        orderingCustomers,
        repeatCustomers,
        repeatRate,
      },
      signups: signupSeries,
      topCustomers,
      wishlistTop: wishlistRows,
    };
  }
}
