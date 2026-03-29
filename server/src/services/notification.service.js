import nodemailer from "nodemailer";

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWinnerEmail(winner) {
    const { email, name, prizeAmount, matchType, drawMonth, drawYear } = winner;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
        <h1 style="color: #10b981; text-align: center;">Congratulations, ${name}!</h1>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">
          You have matched <strong>${matchType} numbers</strong> in the <strong>${drawMonth} ${drawYear}</strong> Monthly Draw!
        </p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #10b981;">
          <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold;">Your Prize Amount</p>
          <h2 style="margin: 10px 0; color: #0f172a; font-size: 32px;">₹${prizeAmount.toLocaleString()}</h2>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          To claim your prize, please login to your dashboard and upload your payment proof (Stripe receipt or ID verification) for our admins to review.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Thank you for supporting our partner charities. Good luck in the next draw!
        </p>
      </div>
    `;

    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not set. Email notification skipped for:", email);
        return;
      }

      await this.transporter.sendMail({
        from: `"Golf Charity Platform" <${process.env.FROM_EMAIL || "noreply@golfcharity.com"}>`,
        to: email,
        subject: `🏆 Congratulations! You won ₹${prizeAmount} in the Monthly Draw!`,
        html: htmlContent,
      });

      console.log(`Notification sent to ${email}`);
    } catch (error) {
      console.error("Failed to send winner email:", error);
    }
  }
}

export default new NotificationService();
