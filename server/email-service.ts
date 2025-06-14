import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/verify-email/${token}`;
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: '🔐 Verify Your Email - Attack on Hash Function CTF',
    html: `
      <div style="font-family: 'Courier New', monospace; background-color: #0a0a0a; color: #00ff00; padding: 20px; border: 2px solid #00ff00;">
        <h1 style="color: #00ff00; text-align: center;">⚡ ATTACK ON HASH FUNCTION ⚡</h1>
        <div style="background-color: #111; border: 1px solid #00ff00; padding: 15px; margin: 20px 0;">
          <h2 style="color: #00ff00;">📧 Email Verification Required</h2>
          <p>Welcome to the CTF platform! To complete your registration and start hacking challenges, please verify your email address.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #00ff00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
              🔓 VERIFY EMAIL
            </a>
          </div>
          
          <p style="font-size: 12px; color: #888;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 12px; color: #00ff00;">${verificationUrl}</p>
          
          <hr style="border-color: #00ff00; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">
            This link will expire in 24 hours for security reasons.<br>
            If you didn't create an account, please ignore this email.
          </p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #888;">
          Happy Hacking! 🚀<br>
          Attack on Hash Function Team
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}