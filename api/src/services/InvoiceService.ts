import PDFDocument from 'pdfkit';
import type { Response } from 'express';

interface InvoiceOrder {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: unknown;
  discountAmount: unknown;
  shippingAmount: unknown;
  total: unknown;
  currency: string;
  couponCode: string | null;
  shipFullName: string;
  shipPhone: string;
  shipEmail: string;
  shipAddressLine1: string;
  shipAddressLine2: string | null;
  shipCity: string;
  shipDistrict: string;
  shipPostalCode: string | null;
  shipCountry: string;
  notes: string | null;
  createdAt: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: unknown;
    lineTotal: unknown;
  }>;
}

function money(v: unknown, currency: string): string {
  const n = Number(v);
  return `${currency} ${n.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const INK = '#22222c';
const INK_SOFT = '#6b6a80';
const INDIGO = '#3f3d81';
const LINE = '#e5e2d9';

export class InvoiceService {
  streamInvoice(order: InvoiceOrder, res: Response): void {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    doc.pipe(res);

    doc
      .fillColor(INDIGO)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('KidPulse', 48, 48);
    doc
      .fillColor(INK_SOFT)
      .fontSize(10)
      .font('Helvetica')
      .text('kidpulse.lk', 48, 74);

    doc
      .fillColor(INK)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('INVOICE', 400, 48, { align: 'right', width: 147 });
    doc
      .fillColor(INK_SOFT)
      .fontSize(10)
      .font('Helvetica')
      .text(`Order ${order.orderNumber}`, 400, 72, { align: 'right', width: 147 })
      .text(
        order.createdAt.toLocaleDateString('en-LK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        400,
        86,
        { align: 'right', width: 147 }
      );

    doc.moveTo(48, 118).lineTo(547, 118).strokeColor(LINE).stroke();

    doc
      .fillColor(INK_SOFT)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('BILL TO', 48, 132);
    doc
      .fillColor(INK)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(order.shipFullName, 48, 148);
    doc
      .fillColor(INK)
      .font('Helvetica')
      .fontSize(10)
      .text(order.shipAddressLine1, 48, 164);
    if (order.shipAddressLine2) doc.text(order.shipAddressLine2);
    doc.text(
      `${order.shipCity}, ${order.shipDistrict}${
        order.shipPostalCode ? ` ${order.shipPostalCode}` : ''
      }`
    );
    doc.text(order.shipCountry);
    doc.text(order.shipPhone);
    doc.text(order.shipEmail);

    doc
      .fillColor(INK_SOFT)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('PAYMENT', 320, 132);
    doc
      .fillColor(INK)
      .fontSize(10)
      .font('Helvetica')
      .text(`Method: ${order.paymentMethod}`, 320, 148)
      .text(`Status: ${order.paymentStatus}`)
      .text(`Order status: ${order.status}`);
    if (order.couponCode) doc.text(`Coupon: ${order.couponCode}`);

    let y = doc.y + 24;
    doc
      .fillColor(INK_SOFT)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('ITEM', 48, y)
      .text('QTY', 340, y, { width: 40, align: 'right' })
      .text('PRICE', 390, y, { width: 70, align: 'right' })
      .text('TOTAL', 470, y, { width: 77, align: 'right' });
    y += 14;
    doc.moveTo(48, y).lineTo(547, y).strokeColor(LINE).stroke();
    y += 8;

    doc.font('Helvetica').fontSize(10).fillColor(INK);
    for (const item of order.items) {
      const height = doc.heightOfString(item.name, { width: 280 });
      doc.text(item.name, 48, y, { width: 280 });
      doc.text(String(item.quantity), 340, y, { width: 40, align: 'right' });
      doc.text(money(item.price, order.currency), 390, y, { width: 70, align: 'right' });
      doc.text(money(item.lineTotal, order.currency), 470, y, {
        width: 77,
        align: 'right',
      });
      y += Math.max(height, 14) + 6;
    }

    y += 6;
    doc.moveTo(340, y).lineTo(547, y).strokeColor(LINE).stroke();
    y += 8;

    const row = (label: string, value: string, bold = false) => {
      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(bold ? 12 : 10)
        .fillColor(bold ? INK : INK_SOFT)
        .text(label, 340, y, { width: 120, align: 'right' });
      doc
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(INK)
        .text(value, 470, y, { width: 77, align: 'right' });
      y += bold ? 20 : 16;
    };

    row('Subtotal', money(order.subtotal, order.currency));
    if (Number(order.discountAmount) > 0) {
      row('Discount', `− ${money(order.discountAmount, order.currency)}`);
    }
    row(
      'Shipping',
      Number(order.shippingAmount) === 0 ? 'Free' : money(order.shippingAmount, order.currency)
    );
    y += 4;
    row('Total', money(order.total, order.currency), true);

    if (order.notes) {
      y += 20;
      doc
        .fillColor(INK_SOFT)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('NOTES', 48, y);
      doc
        .fillColor(INK)
        .fontSize(10)
        .font('Helvetica')
        .text(order.notes, 48, y + 14, { width: 499 });
    }

    doc
      .fillColor(INK_SOFT)
      .fontSize(9)
      .font('Helvetica')
      .text('Thank you for shopping with KidPulse.', 48, 780, {
        width: 499,
        align: 'center',
      });

    doc.end();
  }

  streamPackingSlip(order: InvoiceOrder, res: Response): void {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    doc.pipe(res);

    doc
      .fillColor(INDIGO)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('KidPulse', 48, 48);
    doc
      .fillColor(INK_SOFT)
      .fontSize(10)
      .font('Helvetica')
      .text('kidpulse.lk', 48, 74);

    doc
      .fillColor(INK)
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PACKING SLIP', 380, 48, { align: 'right', width: 167 });
    doc
      .fillColor(INK_SOFT)
      .fontSize(10)
      .font('Helvetica')
      .text(`Order ${order.orderNumber}`, 380, 72, { align: 'right', width: 167 })
      .text(
        order.createdAt.toLocaleDateString('en-LK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        380,
        86,
        { align: 'right', width: 167 }
      );

    doc.moveTo(48, 118).lineTo(547, 118).strokeColor(LINE).stroke();

    doc
      .fillColor(INK_SOFT)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DELIVER TO', 48, 132);
    doc
      .fillColor(INK)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(order.shipFullName, 48, 148);
    doc
      .fillColor(INK)
      .font('Helvetica')
      .fontSize(10)
      .text(order.shipAddressLine1, 48, 164);
    if (order.shipAddressLine2) doc.text(order.shipAddressLine2);
    doc.text(
      `${order.shipCity}, ${order.shipDistrict}${
        order.shipPostalCode ? ` ${order.shipPostalCode}` : ''
      }`
    );
    doc.text(order.shipCountry);
    doc.text(order.shipPhone);

    let y = doc.y + 24;
    doc
      .fillColor(INK_SOFT)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('ITEM', 48, y)
      .text('QTY', 470, y, { width: 77, align: 'right' });
    y += 14;
    doc.moveTo(48, y).lineTo(547, y).strokeColor(LINE).stroke();
    y += 8;

    doc.font('Helvetica').fontSize(10).fillColor(INK);
    for (const item of order.items) {
      const height = doc.heightOfString(item.name, { width: 380 });
      doc.text(item.name, 48, y, { width: 380 });
      doc.text(String(item.quantity), 470, y, { width: 77, align: 'right' });
      y += Math.max(height, 14) + 6;
    }

    y += 6;
    doc.moveTo(48, y).lineTo(547, y).strokeColor(LINE).stroke();
    y += 8;
    const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(INK)
      .text(`Total items: ${totalUnits}`, 48, y);

    if (order.notes) {
      y += 24;
      doc
        .fillColor(INK_SOFT)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('NOTES', 48, y);
      doc
        .fillColor(INK)
        .fontSize(10)
        .font('Helvetica')
        .text(order.notes, 48, y + 14, { width: 499 });
    }

    doc
      .fillColor(INK_SOFT)
      .fontSize(9)
      .font('Helvetica')
      .text('Packed with care by KidPulse.', 48, 780, {
        width: 499,
        align: 'center',
      });

    doc.end();
  }
}
