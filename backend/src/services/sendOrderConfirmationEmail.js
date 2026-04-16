import sendEmail from "./emailService.js";

const sendOrderConfirmationEmail = async (email, orderDetail) => {
  const orderDate = orderDetail?.createdAt
    ? new Date(orderDetail.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const shippingCharge = Number(orderDetail?.shippingCharge || 0);
  const grandTotal = Number(orderDetail?.grandTotal || 0);
  const orderItems = Array.isArray(orderDetail?.orderItems)
    ? orderDetail.orderItems
    : [];

  const itemRows = orderItems
    .map((item) => {
      const unitPrice = Number(item?.sellingPrice || item?.price || 0);
      const quantity = Number(item?.quantity || 0);
      const itemTotal = unitPrice * quantity;

      return `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; line-height:1.5;">
            <strong>${item?.productName || "Product"}</strong><br/>
            <span style="color:#475569;">Qty: ${quantity} x INR ${unitPrice.toFixed(2)}</span>
          </td>
          <td style="padding:10px 0; border-bottom:1px solid #e2e8f0; color:#0f172a; font-size:14px; text-align:right; white-space:nowrap;">
            INR ${itemTotal.toFixed(2)}
          </td>
        </tr>`;
    })
    .join("");

  const shippingAddress = Object.values(orderDetail?.shippingAddress || {})
    .filter(Boolean)
    .map((item) => item.toString().trim())
    .join(", ");

  const previewText = `Your order ${orderDetail?.orderId || ""} is confirmed.`;
  const htmlContent = `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${previewText}</div>
    <div style="margin:0; padding:0; background-color:#eff6ff; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background-color:#eff6ff; padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px; border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 14px 0; text-align:center; font-size:22px; font-weight:800; color:#1e1b4b; letter-spacing:0.3px;">
                  Browse Mart
                </td>
              </tr>
              <tr>
                <td style="background:#ffffff; border:1px solid #dbeafe; border-radius:16px; overflow:hidden; box-shadow:0 14px 36px rgba(30, 27, 75, 0.12);">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="background:linear-gradient(135deg, #0f766e, #0e7490); color:#ffffff; padding:20px 24px;">
                        <div style="font-size:20px; font-weight:800; margin-bottom:6px;">Order Confirmed</div>
                        <div style="font-size:14px; opacity:0.95;">Thank you for shopping with Browse Mart.</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 24px 8px 24px; color:#0f172a; font-size:15px; line-height:1.7;">
                        <p style="margin:0 0 10px 0;"><strong>Order ID:</strong> ${orderDetail?.orderId || "N/A"}</p>
                        <p style="margin:0 0 10px 0;"><strong>Order Date:</strong> ${orderDate}</p>
                        <p style="margin:0;"><strong>Estimated Delivery:</strong> 4-7 business days</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 24px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                          <tr>
                            <td colspan="2" style="padding-bottom:8px; font-size:15px; font-weight:700; color:#0f172a;">Order Summary</td>
                          </tr>
                          ${itemRows}
                          <tr>
                            <td style="padding:12px 0 6px 0; color:#475569; font-size:14px;">Shipping</td>
                            <td style="padding:12px 0 6px 0; color:#475569; font-size:14px; text-align:right;">INR ${shippingCharge.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0 0 0; color:#0f172a; font-size:16px; font-weight:800;">Total</td>
                            <td style="padding:6px 0 0 0; color:#0f172a; font-size:16px; font-weight:800; text-align:right;">INR ${grandTotal.toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 24px 6px 24px; color:#0f172a; font-size:15px; font-weight:700;">
                        Shipping Address
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 24px 8px 24px; color:#334155; font-size:14px; line-height:1.65;">
                        ${shippingAddress || "Address not available"}
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:14px 24px 20px 24px;">
                        <a href="https://browsemart.vercel.app/order/${orderDetail?.orderId || ""}" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700; border-radius:10px; padding:12px 22px;">
                          Track Your Order
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:14px 24px 20px 24px; color:#64748b; font-size:12px; border-top:1px solid #e2e8f0;">
                        Need help with this order? Reply to this email and our support team will help you.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:12px; text-align:center; color:#64748b; font-size:12px; line-height:1.6;">
                  Browse Mart, India<br/>This is an automated confirmation email.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  await sendEmail(
    email,
    `Order Confirmation - ${orderDetail?.orderId}`,
    htmlContent,
  );
};

export default sendOrderConfirmationEmail;
