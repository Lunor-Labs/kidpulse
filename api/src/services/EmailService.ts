import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../lib/logger';

export interface OrderEmailContext {
  orderNumber: string;
  customerName: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  currency: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  ship: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    district: string;
    postalCode?: string | null;
    country: string;
  };
  webBaseUrl: string;
}

export interface BankTransferContext {
  bankAccountName: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountNumber: string | null;
  whatsappNumber: string | null;
  deadlineDays: number;
}

export interface StatusChangeContext {
  orderNumber: string;
  customerName: string;
  fromStatus: string | null;
  toStatus: string;
  webBaseUrl: string;
}

export interface WelcomeGuestContext {
  fullName: string;
  loginUrl: string;
}

export interface LowStockItem {
  name: string;
  sku: string | null;
  stockQuantity: number;
  threshold: number;
}

function fmt(v: number, currency: string): string {
  return `${currency} ${v.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function baseLayout(title: string, inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#faf6ef;color:#22222c;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:28px;border:1px solid #eee">
    <h1 style="font-size:20px;margin:0 0 12px;color:#3f3d81">KidPulse</h1>
    ${inner}
  </div>
  <p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#8b8899;text-align:center">
    You are receiving this because you placed an order on KidPulse.
  </p>
</body></html>`;
}

function itemsTable(ctx: OrderEmailContext): string {
  const rows = ctx.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0">${escapeHtml(item.name)} × ${item.quantity}</td>
      <td style="padding:6px 0;text-align:right">${fmt(item.lineTotal, ctx.currency)}</td></tr>`
    )
    .join('');
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    ${rows}
    <tr><td colspan="2" style="border-top:1px solid #eee;padding-top:8px"></td></tr>
    <tr><td>Subtotal</td><td style="text-align:right">${fmt(ctx.subtotal, ctx.currency)}</td></tr>
    ${
      ctx.discountAmount > 0
        ? `<tr><td>Discount</td><td style="text-align:right;color:#6b8e23">−${fmt(ctx.discountAmount, ctx.currency)}</td></tr>`
        : ''
    }
    <tr><td>Shipping</td><td style="text-align:right">${
      ctx.shippingAmount === 0 ? 'Free' : fmt(ctx.shippingAmount, ctx.currency)
    }</td></tr>
    <tr><td style="font-weight:700;padding-top:8px;border-top:1px solid #eee">Total</td>
        <td style="text-align:right;font-weight:700;padding-top:8px;border-top:1px solid #eee">${fmt(ctx.total, ctx.currency)}</td></tr>
  </table>`;
}

function shipBlock(ctx: OrderEmailContext): string {
  return `<div style="margin-top:16px;font-size:14px;color:#555">
    <strong style="color:#22222c">Ship to</strong><br>
    ${escapeHtml(ctx.ship.fullName)}<br>
    ${escapeHtml(ctx.ship.addressLine1)}${ctx.ship.addressLine2 ? `, ${escapeHtml(ctx.ship.addressLine2)}` : ''}<br>
    ${escapeHtml(ctx.ship.city)}, ${escapeHtml(ctx.ship.district)}${ctx.ship.postalCode ? ` ${escapeHtml(ctx.ship.postalCode)}` : ''}<br>
    ${escapeHtml(ctx.ship.phone)}
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pending payment',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

let smtpTransport: Transporter | null = null;

function getSmtpTransport(): Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return smtpTransport;
}

export class EmailService {
  private readonly apiKey = env.RESEND_API_KEY;
  private readonly from = env.EMAIL_FROM;

  private async send(to: string, subject: string, html: string): Promise<void> {
    const smtp = getSmtpTransport();
    if (smtp) {
      try {
        await smtp.sendMail({ from: this.from, to, subject, html });
        logger.info({ to, subject }, 'Email sent via SMTP');
      } catch (err) {
        logger.warn({ err, to, subject }, 'SMTP email failed');
      }
      return;
    }
    if (!this.apiKey) {
      logger.info({ to, subject }, 'EmailService: no SMTP or RESEND_API_KEY set — email logged only');
      return;
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: this.from, to, subject, html }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        logger.warn({ status: res.status, body, to, subject }, 'Resend email failed');
      }
    } catch (err) {
      logger.warn({ err, to, subject }, 'Resend email threw');
    }
  }

  async sendOrderConfirmation(to: string, ctx: OrderEmailContext): Promise<void> {
    const link = `${ctx.webBaseUrl}/checkout/success/${ctx.orderNumber}`;
    const html = baseLayout(
      `Order ${ctx.orderNumber}`,
      `<p>Hi ${escapeHtml(ctx.customerName)},</p>
       <p>Thanks for your order — <strong>${escapeHtml(ctx.orderNumber)}</strong>. Here's a copy for your records.</p>
       ${itemsTable(ctx)}
       ${shipBlock(ctx)}
       <p style="margin-top:20px"><a href="${link}" style="display:inline-block;background:#3f3d81;color:white;padding:10px 18px;border-radius:10px;text-decoration:none">View order</a></p>`
    );
    await this.send(to, `Order confirmation — ${ctx.orderNumber}`, html);
  }

  async sendBankTransferInstructions(
    to: string,
    ctx: OrderEmailContext,
    bank: BankTransferContext
  ): Promise<void> {
    const bankRows = [
      ['Account name', bank.bankAccountName],
      ['Bank', bank.bankName],
      ['Branch', bank.bankBranch],
      ['Account #', bank.bankAccountNumber],
    ]
      .filter(([, v]) => Boolean(v))
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 8px 4px 0;color:#555">${k}</td><td style="font-weight:600">${escapeHtml(String(v))}</td></tr>`
      )
      .join('');
    const html = baseLayout(
      `Bank transfer — ${ctx.orderNumber}`,
      `<p>Hi ${escapeHtml(ctx.customerName)},</p>
       <p>Your order <strong>${escapeHtml(ctx.orderNumber)}</strong> is reserved. Please transfer <strong>${fmt(ctx.total, ctx.currency)}</strong> within <strong>${bank.deadlineDays} day(s)</strong> to the account below.</p>
       <table style="font-size:14px;margin-top:8px">${bankRows}</table>
       ${
         bank.whatsappNumber
           ? `<p>After the transfer, send the receipt to WhatsApp: <strong>${escapeHtml(bank.whatsappNumber)}</strong></p>`
           : ''
       }
       ${itemsTable(ctx)}
       ${shipBlock(ctx)}`
    );
    await this.send(to, `Bank transfer instructions — ${ctx.orderNumber}`, html);
  }

  async sendPaymentReceived(to: string, ctx: OrderEmailContext): Promise<void> {
    const html = baseLayout(
      `Payment received — ${ctx.orderNumber}`,
      `<p>Hi ${escapeHtml(ctx.customerName)},</p>
       <p>We've received your payment for <strong>${escapeHtml(ctx.orderNumber)}</strong> (${fmt(ctx.total, ctx.currency)}). Your order is now being processed.</p>`
    );
    await this.send(to, `Payment received — ${ctx.orderNumber}`, html);
  }

  async sendStatusChange(to: string, ctx: StatusChangeContext): Promise<void> {
    const label = STATUS_LABELS[ctx.toStatus] ?? ctx.toStatus;
    const link = `${ctx.webBaseUrl}/account/orders/${ctx.orderNumber}`;
    const html = baseLayout(
      `Order update — ${ctx.orderNumber}`,
      `<p>Hi ${escapeHtml(ctx.customerName)},</p>
       <p>Your order <strong>${escapeHtml(ctx.orderNumber)}</strong> is now <strong>${escapeHtml(label)}</strong>.</p>
       <p><a href="${link}" style="color:#3f3d81">View order details</a></p>`
    );
    await this.send(to, `Order ${ctx.orderNumber} — ${label}`, html);
  }

  async sendLowStockAlert(to: string, items: LowStockItem[]): Promise<void> {
    const rows = items
      .map(
        (item) =>
          `<tr><td style="padding:6px 0">${escapeHtml(item.name)}${
            item.sku ? ` <span style="color:#8b8899">(${escapeHtml(item.sku)})</span>` : ''
          }</td>
          <td style="padding:6px 0;text-align:right;font-weight:700;color:${
            item.stockQuantity === 0 ? '#c0392b' : '#b8860b'
          }">${item.stockQuantity} left</td></tr>`
      )
      .join('');
    const html = baseLayout(
      'Low stock alert',
      `<p>The following products fell to or below their low-stock threshold after a recent order:</p>
       <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
       <p style="font-size:13px;color:#8b8899">Restock or adjust thresholds in the admin panel.</p>`
    );
    await this.send(to, `Low stock alert — ${items.length} product${items.length !== 1 ? 's' : ''}`, html);
  }

  async sendWelcomeGuest(to: string, ctx: WelcomeGuestContext): Promise<void> {
    const html = baseLayout(
      'Welcome to KidPulse',
      `<p>Hi ${escapeHtml(ctx.fullName)},</p>
       <p>We've created a KidPulse account for you so you can track your order and shop faster next time.</p>
       <p><a href="${ctx.loginUrl}" style="display:inline-block;background:#3f3d81;color:white;padding:10px 18px;border-radius:10px;text-decoration:none">Sign in with magic link</a></p>
       <p style="font-size:12px;color:#8b8899">If you didn't check out on KidPulse, you can safely ignore this email.</p>`
    );
    await this.send(to, 'Welcome to KidPulse', html);
  }
}
