import nodemailer from "nodemailer";

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  static async init() {
    if (this.transporter) return;

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log("Real SMTP transport initialized.");
    } else {
      // Create a testing account on Ethereal Email
      console.log("Initializing Ethereal Email (Test SMTP)...");
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("Ethereal test account ready.");
    }
  }

  static async sendVerificationEmail(to: string, token: string) {
    await this.init();
    
    // Fallback to localhost if not specified
    const appUrl = process.env.APP_URL || "http://localhost:5000";
    const verificationLink = `${appUrl}/api/auth/verify-email?token=${token}`;

    const info = await this.transporter!.sendMail({
      from: '"CareNexus Verification" <no-reply@carenexus.com>',
      to,
      subject: "Please verify your email address",
      text: `Welcome to CareNexus. Please verify your email by clicking: ${verificationLink}`,
      html: `
        <h2>Welcome to CareNexus</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });

    console.log(`Verification email sent to ${to}. Message ID: ${info.messageId}`);
    
    // In test mode, nodemailer provides a preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n=== EMAIL PREVIEW ===\nView the email here: ${previewUrl}\n=====================\n`);
    }
  }
}
