import 'server-only';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send a transactional email via Brevo.
 * @param {{ to: string, toName?: string, subject: string, html: string }} options
 */
async function sendEmail({ to, toName = '', subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY not set — skipping email send');
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key':      apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_FROM_EMAIL,
        name:  process.env.BREVO_FROM_NAME,
      },
      to:      [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[email] Brevo error ${res.status}:`, text);
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Send order confirmation to customer.
 */
export async function sendOrderConfirmation(order) {
  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;">${i.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;">Rs. ${i.price.toLocaleString()}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Order Confirmation</title></head>
    <body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <div style="background:linear-gradient(135deg,#e91e8c,#9c27b0);padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">🎉 Order Confirmed!</h1>
          <p style="color:rgba(255,255,255,.85);margin:8px 0 0;">Thank you for shopping with Cute Things</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#333;">Hi <strong>${order.customer.name}</strong>,</p>
          <p style="color:#555;">Your order <strong>#${order.orderNumber}</strong> has been received and is being processed.</p>

          <table style="width:100%;border-collapse:collapse;margin:24px 0;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:10px;text-align:left;">Product</th>
                <th style="padding:10px;text-align:center;">Qty</th>
                <th style="padding:10px;text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="background:#f9f0ff;border-radius:8px;padding:16px;margin-top:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#555;">Subtotal</span>
              <span>Rs. ${order.subtotal.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#555;">Shipping</span>
              <span>Rs. ${order.shippingFee.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:18px;border-top:2px solid #e91e8c;padding-top:8px;margin-top:8px;">
              <span>Total</span>
              <span style="color:#e91e8c;">Rs. ${order.total.toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-top:24px;background:#fff9e6;border-radius:8px;padding:16px;">
            <h3 style="margin:0 0 8px;color:#333;">Delivery Address</h3>
            <p style="margin:0;color:#555;">${order.customer.address}, ${order.customer.city}</p>
            <p style="margin:4px 0 0;color:#555;">${order.customer.phone}</p>
          </div>

          <p style="margin-top:24px;color:#555;">Payment Method: <strong>Cash on Delivery</strong></p>
          <p style="color:#888;font-size:13px;margin-top:32px;">We'll notify you when your order is dispatched. For inquiries, contact us on Facebook or TikTok.</p>
        </div>
        <div style="background:#f5f5f5;padding:16px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} Cute Things. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;

  await sendEmail({
    to:      order.customer.email,
    toName:  order.customer.name,
    subject: `Order Confirmed — #${order.orderNumber} | Cute Things`,
    html,
  });
}

/**
 * Notify admin of a new order.
 */
export async function sendAdminNewOrderAlert(order) {
  const adminEmail = process.env.BREVO_FROM_EMAIL;
  const html = `
    <h2>New Order: #${order.orderNumber}</h2>
    <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.email})</p>
    <p><strong>Phone:</strong> ${order.customer.phone}</p>
    <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
    <p><strong>Total:</strong> Rs. ${order.total.toLocaleString()}</p>
    <p><strong>Items:</strong> ${order.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</p>`;

  await sendEmail({
    to:      adminEmail,
    toName:  'Cute Things Admin',
    subject: `🛍️ New Order #${order.orderNumber} — Rs. ${order.total.toLocaleString()}`,
    html,
  });
}

/**
 * Send order status update to customer.
 */
export async function sendOrderStatusUpdate(order, newStatus) {
  const statusLabels = {
    confirmed:          'Your order has been confirmed.',
    processing:         'Your order is being prepared.',
    ready_for_dispatch: 'Your order is ready for dispatch.',
    dispatched:         'Your order is on the way! 🚚',
    delivered:          'Your order has been delivered.',
    completed:          'Order complete. Thank you! 💖',
    cancelled:          'Your order has been cancelled.',
  };

  const message = statusLabels[newStatus] ?? `Order status updated to: ${newStatus}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#e91e8c,#9c27b0);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h2 style="color:#fff;margin:0;">Order Update</h2>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #f0f0f0;">
        <p>Hi <strong>${order.customer.name}</strong>,</p>
        <p>${message}</p>
        <p>Order: <strong>#${order.orderNumber}</strong></p>
        <p style="color:#888;font-size:13px;">Thank you for shopping with Cute Things 🌸</p>
      </div>
    </div>`;

  await sendEmail({
    to:      order.customer.email,
    toName:  order.customer.name,
    subject: `Order #${order.orderNumber} Update — Cute Things`,
    html,
  });
}
