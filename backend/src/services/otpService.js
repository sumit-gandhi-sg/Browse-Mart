import sendEmail from "./emailService.js";
import bcrypt from "bcrypt";

const getOtpTemplateConfig = (subject = "") => {
  const normalizedSubject = subject.toLowerCase();

  if (
    normalizedSubject.includes("password") ||
    normalizedSubject.includes("forget") ||
    normalizedSubject.includes("forgot") ||
    normalizedSubject.includes("reset")
  ) {
    return {
      title: "Password Reset Verification",
      intro:
        "We received a request to reset your Browse Mart account password. Use the OTP below to continue.",
      helper:
        "If you did not request a password reset, ignore this email and keep your account secure.",
      accentStart: "#dc2626",
      accentEnd: "#b91c1c",
      otpBackground: "#fef2f2",
      otpBorder: "#fca5a5",
      previewText:
        "Reset request received. Use this OTP to change your password.",
    };
  }

  if (
    normalizedSubject.includes("login") ||
    normalizedSubject.includes("sign in")
  ) {
    return {
      title: "Login Verification",
      intro:
        "Use this OTP to verify your email and complete secure sign-in to your Browse Mart account.",
      helper:
        "If this login attempt was not made by you, change your password immediately after sign-in.",
      accentStart: "#4338ca",
      accentEnd: "#3730a3",
      otpBackground: "#eef2ff",
      otpBorder: "#a5b4fc",
      previewText: "Use this OTP to verify your login on Browse Mart.",
    };
  }

  return {
    title: "Registration Verification",
    intro:
      "Welcome to Browse Mart. Use the OTP below to verify your email and activate your account.",
    helper:
      "If you did not create this account, you can safely ignore this email.",
    accentStart: "#2563eb",
    accentEnd: "#1d4ed8",
    otpBackground: "#eff6ff",
    otpBorder: "#93c5fd",
    previewText: "Verify your Browse Mart account with this OTP.",
  };
};

const sendOtpEmail = async (email, subject) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp.toString()?.trim(), salt);
    const template = getOtpTemplateConfig(subject);
    const htmlContent = `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${template.previewText}</div>
    <div style="margin:0; padding:0; background-color:#eef2ff; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background-color:#eef2ff; padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 14px 0; text-align:center; font-size:22px; font-weight:800; color:#1e1b4b; letter-spacing:0.3px;">
                  Browse Mart
                </td>
              </tr>
              <tr>
                <td style="background-color:#ffffff; border:1px solid #dbeafe; border-radius:16px; overflow:hidden; box-shadow:0 14px 36px rgba(30, 27, 75, 0.12);">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="background:linear-gradient(135deg, ${template.accentStart}, ${template.accentEnd}); color:#ffffff; padding:18px 22px; font-size:17px; font-weight:700;">
                        ${template.title}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 22px 8px 22px; color:#0f172a; font-size:15px; line-height:1.65;">
                        <p style="margin:0 0 12px 0;">Hello,</p>
                        <p style="margin:0 0 12px 0;">${template.intro}</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:10px 22px 6px 22px;">
                        <div style="display:inline-block; letter-spacing:9px; font-size:30px; font-weight:800; color:#0f172a; background:${template.otpBackground}; border:1px dashed ${template.otpBorder}; border-radius:12px; padding:12px 18px;">
                          ${otp}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 22px 8px 22px; color:#334155; font-size:14px; line-height:1.65;">
                        <p style="margin:0 0 8px 0;">This OTP is valid for <strong style="color:#dc2626;">10 minutes</strong>. Do not share it with anyone.</p>
                        <p style="margin:0;">${template.helper}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:18px 22px 22px 22px; color:#64748b; font-size:12px; border-top:1px solid #e2e8f0;">
                        Need help? Reply to this email and our team will assist you.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:12px; text-align:center; color:#64748b; font-size:12px; line-height:1.6;">
                  This is an automated message from Browse Mart.<br/>Please do not share your OTP with anyone.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
        `;
    const isEmailSent = await sendEmail(email, subject, htmlContent);
    return isEmailSent ? hashOtp : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default sendOtpEmail;
