import crypto from 'node:crypto';
import { env } from '../config/env';
import { AppError } from '../lib/AppError';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { EmailService } from './EmailService';

const PAYHERE_LIVE = 'https://www.payhere.lk/pay/checkout';
const PAYHERE_SANDBOX = 'https://sandbox.payhere.lk/pay/checkout';

function md5Upper(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex').toUpperCase();
}

export interface PayHereStartFields {
  action: string;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  sandbox: '1' | '0';
}

export interface PayHereNotifyBody {
  merchant_id?: string;
  order_id?: string;
  payhere_amount?: string;
  payhere_currency?: string;
  status_code?: string;
  md5sig?: string;
  payment_id?: string;
}

export class PayHereService {
  constructor(private emailService = new EmailService()) {}

  isConfigured(): boolean {
    return Boolean(env.PAYHERE_MERCHANT_ID && env.PAYHERE_MERCHANT_SECRET);
  }

  private assertConfigured(): asserts this is this & {
    merchantId: string;
    merchantSecret: string;
  } {
    if (!this.isConfigured()) {
      throw new AppError('PayHere is not configured on the server', 503);
    }
  }

  async buildStartFields(orderNumber: string): Promise<PayHereStartFields> {
    this.assertConfigured();
    const merchantId = env.PAYHERE_MERCHANT_ID!;
    const merchantSecret = env.PAYHERE_MERCHANT_SECRET!;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.paymentMethod !== 'PAYHERE') {
      throw new AppError('Order is not a PayHere order', 400);
    }
    if (order.paymentStatus === 'PAID') {
      throw new AppError('Order already paid', 400);
    }
    if (order.paymentAttempts >= 3) {
      throw new AppError('Payment attempt limit reached', 400);
    }

    const amount = Number(order.total).toFixed(2);
    const secretHash = md5Upper(merchantSecret);
    const hash = md5Upper(`${merchantId}${orderNumber}${amount}${order.currency}${secretHash}`);

    const itemsLabel =
      order.items.length === 1
        ? order.items[0].name
        : `${order.items.length} items`;

    const [firstName, ...rest] = order.shipFullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    return {
      action: env.PAYHERE_SANDBOX ? PAYHERE_SANDBOX : PAYHERE_LIVE,
      merchant_id: merchantId,
      return_url: `${env.WEB_BASE_URL}/checkout/success/${orderNumber}?src=payhere`,
      cancel_url: `${env.WEB_BASE_URL}/checkout/failed/${orderNumber}?src=payhere`,
      notify_url: `${env.API_PUBLIC_URL.replace(/\/$/, '')}/api/v1/payments/payhere/notify`,
      order_id: orderNumber,
      items: itemsLabel,
      currency: order.currency,
      amount,
      hash,
      first_name: firstName,
      last_name: lastName,
      email: order.shipEmail,
      phone: order.shipPhone,
      address: [order.shipAddressLine1, order.shipAddressLine2].filter(Boolean).join(', '),
      city: order.shipCity,
      country: order.shipCountry,
      sandbox: env.PAYHERE_SANDBOX ? '1' : '0',
    };
  }

  async handleNotify(body: PayHereNotifyBody): Promise<void> {
    this.assertConfigured();
    const merchantSecret = env.PAYHERE_MERCHANT_SECRET!;
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = body;

    if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
      throw new AppError('Missing PayHere fields', 400);
    }
    const secretHash = md5Upper(merchantSecret);
    const expected = md5Upper(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`
    );
    if (expected !== md5sig.toUpperCase()) {
      logger.warn({ order_id, expected, got: md5sig }, 'PayHere hash mismatch');
      throw new AppError('Invalid PayHere signature', 400);
    }

    const order = await prisma.order.findUnique({ where: { orderNumber: order_id } });
    if (!order) throw new AppError('Order not found', 404);

    const wasPaid = order.paymentStatus === 'PAID';
    const success = status_code === '2';
    const failed = ['-1', '-2', '-3'].includes(status_code);

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'PAYHERE',
        providerRef: payment_id ?? null,
        status: success ? 'SUCCESS' : failed ? 'FAILED' : 'PENDING',
        amount: Number(payhere_amount),
        rawPayload: JSON.stringify(body),
      },
    });

    if (success && !wasPaid) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID', status: 'PROCESSING' },
        }),
        prisma.orderStatusEvent.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: 'PROCESSING',
            actorType: 'PAYHERE',
            note: 'Payment received via PayHere notify webhook',
          },
        }),
      ]);
      await this.emailService.sendPaymentReceived(order.shipEmail, {
        orderNumber: order.orderNumber,
        customerName: order.shipFullName,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingAmount: Number(order.shippingAmount),
        currency: order.currency,
        items: [],
        ship: {
          fullName: order.shipFullName,
          phone: order.shipPhone,
          addressLine1: order.shipAddressLine1,
          addressLine2: order.shipAddressLine2,
          city: order.shipCity,
          district: order.shipDistrict,
          postalCode: order.shipPostalCode,
          country: order.shipCountry,
        },
        webBaseUrl: env.WEB_BASE_URL,
      });
    } else if (failed) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentAttempts: { increment: 1 },
          paymentStatus: 'FAILED',
        },
      });
    }
  }
}
