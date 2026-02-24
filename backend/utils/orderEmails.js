import axios from "axios";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER = { name: "Divyaveda", email: "singhalanvit534@gmail.com" };

const sendEmail = async (to, subject, htmlContent) => {
    try {
        await axios.post(
            BREVO_URL,
            { sender: SENDER, to: [{ email: to }], subject, htmlContent },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }
        );
    } catch (err) {
        console.error("Email send failed:", err.response?.data || err.message);
        // Don't throw — email failure should not break the request
    }
};

export const sendOrderConfirmationEmail = async (userEmail, order) => {
    const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `).join("");

    const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
    <div style="background:#2d6a4f;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:24px;">🌿 Divyaveda</h1>
      <p style="margin:5px 0 0;">Order Confirmed!</p>
    </div>
    <div style="padding:24px;background:#fff;border:1px solid #eee;">
      <h2 style="color:#2d6a4f;">Hi there! Your order has been placed.</h2>
      <p>Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
      <p>Thank you for shopping with Divyaveda. We have received your order and it is being processed.</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;text-align:left;">Product</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="text-align:right;margin-top:8px;">
        <p style="color:#666;">Subtotal: ₹${order.subtotal?.toFixed(2)}</p>
        <p style="color:#666;">Shipping: ${order.shipping_fee === 0 ? "Free" : "₹" + order.shipping_fee}</p>
        <p style="font-size:18px;font-weight:bold;color:#2d6a4f;">Total: ₹${order.total_amount?.toFixed(2)}</p>
      </div>

      <div style="margin-top:20px;padding:16px;background:#f0fdf4;border-radius:8px;">
        <h3 style="margin:0 0 8px;color:#2d6a4f;">📦 Delivery Address</h3>
        <p style="margin:0;">${order.delivery_address}</p>
        <p style="margin:4px 0 0;color:#666;">Phone: ${order.phone_number}</p>
      </div>

      <p style="margin-top:20px;color:#666;">Estimated Delivery: <strong>${order.estimated_delivery
            ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
            : "5–7 business days"
        }</strong></p>

      <p style="color:#666;font-size:13px;">Payment Method: ${order.payment_method === "COD" ? "Cash on Delivery" : order.payment_method}</p>
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;border-radius:0 0 8px 8px;font-size:12px;color:#999;">
      © 2025 Divyaveda. All rights reserved.
    </div>
  </div>`;

    await sendEmail(userEmail, "🌿 Order Confirmed – Divyaveda", html);
};

export const sendOrderShippedEmail = async (userEmail, order) => {
    const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
    <div style="background:#1d4ed8;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:24px;">🚚 Divyaveda</h1>
      <p style="margin:5px 0 0;">Your order is on the way!</p>
    </div>
    <div style="padding:24px;background:#fff;border:1px solid #eee;">
      <h2 style="color:#1d4ed8;">Great news! Your order has been shipped.</h2>
      <p>Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
      ${order.tracking_number ? `<p>Tracking Number: <strong style="font-size:16px;">${order.tracking_number}</strong></p>` : ""}
      
      ${order.assigned_agent?.name ? `
      <div style="margin:20px 0;padding:16px;background:#eff6ff;border-radius:8px;">
        <h3 style="margin:0 0 8px;color:#1d4ed8;">🧑‍💼 Your Delivery Agent</h3>
        <p style="margin:4px 0;"><strong>${order.assigned_agent.name}</strong></p>
        ${order.assigned_agent.phone ? `<p style="margin:4px 0;">📞 ${order.assigned_agent.phone}</p>` : ""}
      </div>` : ""}

      <div style="margin-top:16px;padding:16px;background:#f0fdf4;border-radius:8px;">
        <h3 style="margin:0 0 8px;color:#2d6a4f;">📦 Delivery To</h3>
        <p style="margin:0;">${order.delivery_address}</p>
      </div>

      <p style="margin-top:20px;color:#666;">Estimated Delivery: <strong>${order.estimated_delivery
            ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
            : "Soon"
        }</strong></p>
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;border-radius:0 0 8px 8px;font-size:12px;color:#999;">
      © 2025 Divyaveda. All rights reserved.
    </div>
  </div>`;

    await sendEmail(userEmail, "🚚 Your Order Has Been Shipped – Divyaveda", html);
};

export const sendOrderDeliveredEmail = async (userEmail, order) => {
    const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
    <div style="background:#16a34a;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:24px;">✅ Divyaveda</h1>
      <p style="margin:5px 0 0;">Order Delivered!</p>
    </div>
    <div style="padding:24px;background:#fff;border:1px solid #eee;">
      <h2 style="color:#16a34a;">Your order has been delivered. Enjoy your purchase!</h2>
      <p>Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
      <p>We hope you love your Divyaveda products. If you have any feedback, please reach out to us.</p>
      <p style="margin-top:20px;">Thank you for shopping with us! 🌿</p>
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;border-radius:0 0 8px 8px;font-size:12px;color:#999;">
      © 2025 Divyaveda. All rights reserved.
    </div>
  </div>`;

    await sendEmail(userEmail, "✅ Order Delivered – Thank you! – Divyaveda", html);
};

export const sendOrderCancelledEmail = async (userEmail, order) => {
    const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
    <div style="background:#dc2626;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:24px;">❌ Divyaveda</h1>
      <p style="margin:5px 0 0;">Order Cancelled</p>
    </div>
    <div style="padding:24px;background:#fff;border:1px solid #eee;">
      <h2 style="color:#dc2626;">Your order has been cancelled.</h2>
      <p>Order ID: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></p>
      ${order.cancel_reason ? `<p>Reason: <em>${order.cancel_reason}</em></p>` : ""}
      <p>If you paid online, a refund will be processed within 5–7 business days.</p>
      <p>Questions? Contact us at support@divyaveda.in</p>
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;border-radius:0 0 8px 8px;font-size:12px;color:#999;">
      © 2025 Divyaveda. All rights reserved.
    </div>
  </div>`;

    await sendEmail(userEmail, "❌ Order Cancelled – Divyaveda", html);
};
