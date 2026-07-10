import { jsPDF } from 'jspdf';
import { formatPrice } from '@/lib/format';

// Generate and download a simple PDF summary/invoice for a B2B order.
export const downloadOrderPdf = (order) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const brand = [183, 45, 36]; // #B72D24
  let y = 48;

  // Header band
  doc.setFillColor(...brand);
  doc.rect(0, 0, W, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Nishree', 40, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Wholesale Order', 40, 70);
  doc.setFontSize(10);
  doc.text(order.order_number || `#${order.id}`, W - 40, 50, { align: 'right' });
  doc.text(order.created_at ? new Date(order.created_at).toLocaleDateString() : '', W - 40, 66, { align: 'right' });

  y = 130;
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Order details', 40, y);
  y += 20;

  const line = (label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(label, 40, y);
    doc.setTextColor(40, 40, 40);
    doc.text(String(value ?? '—'), 200, y);
    y += 18;
  };
  line('Buyer', order.Party?.shop_name || order.Distributor?.name || '—');
  line('Salesman', order.Salesman?.name || '—');
  line('Order type', (order.order_type || '').replace(/_/g, ' ') || '—');
  line('Status', order.status || '—');
  line('Payment', order.payment_status || '—');

  // Items table (if present)
  const items = order.OrderItems || order.items || [];
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text('Items', 40, y);
  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(40, y, W - 40, y);
  y += 18;
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text('Product', 40, y);
  doc.text('Qty', W - 200, y, { align: 'right' });
  doc.text('Price', W - 120, y, { align: 'right' });
  doc.text('Subtotal', W - 40, y, { align: 'right' });
  y += 6;
  doc.line(40, y, W - 40, y);
  y += 16;
  doc.setTextColor(40, 40, 40);
  if (items.length) {
    items.forEach((it) => {
      doc.text(String(it.Product?.name || it.name || `Item ${it.product_id || ''}`).slice(0, 40), 40, y);
      doc.text(String(it.quantity || 1), W - 200, y, { align: 'right' });
      doc.text(formatPrice(it.price || 0), W - 120, y, { align: 'right' });
      doc.text(formatPrice(it.subtotal || (it.price || 0) * (it.quantity || 1)), W - 40, y, { align: 'right' });
      y += 16;
    });
  } else {
    doc.setTextColor(150, 150, 150);
    doc.text('Line items not available in this summary.', 40, y);
    y += 16;
  }

  // Totals
  y += 10;
  doc.line(40, y, W - 40, y);
  y += 20;
  const total = (label, value, bold) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(40, 40, 40);
    doc.text(label, W - 200, y);
    doc.text(formatPrice(value), W - 40, y, { align: 'right' });
    y += 18;
  };
  if (order.subtotal != null) total('Subtotal', order.subtotal);
  if (order.discount_total) total('Discount', -Math.abs(order.discount_total));
  total('Total', order.final_amount || 0, true);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business — Nishree Spices', 40, doc.internal.pageSize.getHeight() - 40);

  doc.save(`${order.order_number || 'order'}.pdf`);
};
