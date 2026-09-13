import bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { OTPRecord } from '../models/UserTypes';

class OTPService {
  private otpStore: Map<string, OTPRecord> = new Map();
  private mailTransporter: nodemailer.Transporter | null = null;

  constructor() {
    this.setupMailer();
  }

  private setupMailer() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      if (host.includes('gmail.com')) {
        this.mailTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
          pool: true,
          maxConnections: 5,
        });
      } else {
        this.mailTransporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          pool: true,
          maxConnections: 5,
        });
      }
      console.log(`[EMAIL SERVICE] Nodemailer configured for SMTP: ${host}`);
    }
  }

  /**
   * Generates a 6-digit cryptographically random OTP string
   */
  private generateNumericOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Request & send OTP for an email or mobile target
   */
  public async requestOTP(
    target: string,
    channel: 'email' | 'mobile'
  ): Promise<{ success: boolean; message: string; cooldownSeconds: number; devOtp?: string }> {
    const cleanTarget = target.trim().toLowerCase();
    const existing = this.otpStore.get(cleanTarget);
    const now = Date.now();

    // Check resend cooldown (60 seconds)
    if (existing && existing.resendCooldownUntil > now) {
      const remainingSecs = Math.ceil((existing.resendCooldownUntil - now) / 1000);
      return {
        success: false,
        message: `Please wait ${remainingSecs} seconds before requesting a new OTP.`,
        cooldownSeconds: remainingSecs,
      };
    }

    const plainOTP = this.generateNumericOTP();
    const otpHash = await bcrypt.hash(plainOTP, 10);
    const expiresAt = now + 5 * 60 * 1000; // Expire after 5 minutes
    const resendCooldownUntil = now + 60 * 1000; // 60s resend cooldown

    const record: OTPRecord = {
      id: `otp-${now}-${Math.random().toString(36).substr(2, 5)}`,
      target: cleanTarget,
      channel,
      otpHash,
      expiresAt,
      resendCooldownUntil,
      attemptsCount: 0,
    };

    this.otpStore.set(cleanTarget, record);

    // Deliver OTP in the background (non-blocking) so response is instantaneous
    this.deliverOTP(cleanTarget, channel, plainOTP).catch((err) => {
      console.error(`[OTP DELIVERY ASYNC ERROR]`, err?.message || err);
    });

    return {
      success: true,
      message: `OTP sent successfully to your ${channel}. Valid for 5 minutes.`,
      cooldownSeconds: 60,
      devOtp: plainOTP,
    };
  }

  /**
   * Verify an entered OTP
   */
  public async verifyOTP(
    target: string,
    code: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanTarget = target.trim().toLowerCase();
    const record = this.otpStore.get(cleanTarget);
    const now = Date.now();

    if (!record) {
      return { success: false, message: 'No active OTP request found for this address/number.' };
    }

    // Check expiry
    if (record.expiresAt < now) {
      this.otpStore.delete(cleanTarget);
      return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    // Check attempt limits (Max 3 attempts)
    if (record.attemptsCount >= 3) {
      this.otpStore.delete(cleanTarget);
      return { success: false, message: 'Too many failed verification attempts. Please request a new OTP.' };
    }

    const isMatch = await bcrypt.compare(code.trim(), record.otpHash);
    if (!isMatch) {
      record.attemptsCount += 1;
      this.otpStore.set(cleanTarget, record);
      return {
        success: false,
        message: `Invalid OTP code. ${3 - record.attemptsCount} attempt(s) remaining.`,
      };
    }

    // OTP Verified! Remove from store to prevent reuse
    this.otpStore.delete(cleanTarget);
    return { success: true, message: 'OTP verified successfully.' };
  }

  /**
   * Real provider delivery handler (Email Nodemailer / SMS Provider)
   */
  private async deliverOTP(target: string, channel: 'email' | 'mobile', plainOTP: string): Promise<void> {
    if (channel === 'email') {
      if (!this.mailTransporter) {
        this.setupMailer();
      }

      if (this.mailTransporter) {
        try {
          const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@smritisetu.gov.in';
          await this.mailTransporter.sendMail({
            from: `"Smriti-Setu National Health Portal" <${fromAddress}>`,
            to: target,
            subject: `Smriti-Setu Platform — Your Verification Code: ${plainOTP}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background-color: #003366; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0; font-size: 20px;">Smriti-Setu Health Portal</h2>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #ffc107;">Government of India · National Health Mission</p>
                </div>
                <div style="padding: 25px; background-color: #fafafa;">
                  <h3 style="color: #333; margin-top: 0;">Account Verification Code</h3>
                  <p style="color: #555; font-size: 14px;">Use the following 6-digit OTP code to complete your verification. This code is valid for 5 minutes:</p>
                  <div style="background-color: #eef2ff; border: 2px dashed #4f46e5; font-size: 32px; font-weight: bold; color: #1e1b4b; text-align: center; padding: 15px; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
                    ${plainOTP}
                  </div>
                  <p style="color: #777; font-size: 12px;">If you did not request this verification code, please ignore this email.</p>
                </div>
                <div style="text-align: center; padding: 10px; font-size: 11px; color: #888;">
                  © 2026 Ministry of Health & Family Welfare, Government of India. All rights reserved.
                </div>
              </div>
            `,
          });
          console.log(`[SMTP EMAIL DELIVERED] Successfully sent OTP ${plainOTP} to ${target}`);
        } catch (err: any) {
          console.error(`[SMTP EMAIL FAILED] Could not send email to ${target}:`, err.message);
        }
      } else {
        // Development Sandbox Logger
        console.log(`\n======================================================`);
        console.log(`[DEVELOPMENT EMAIL OTP] Sent to: ${target}`);
        console.log(`🔑 Verification Code: ${plainOTP}`);
        console.log(`⏳ Expires in 5 minutes`);
        console.log(`======================================================\n`);
      }
    } else {
      // SMS Provider (Fast2SMS for India or Twilio)
      const fast2SmsKey = process.env.FAST2SMS_API_KEY || process.env.SMS_SERVICE_API_KEY;
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (fast2SmsKey) {
        try {
          const numbers = target.replace(/[^0-9]/g, '').slice(-10); // 10-digit mobile number
          const response = await fetch(
            `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2SmsKey}&route=otp&variables_values=${plainOTP}&flash=0&numbers=${numbers}`,
            { method: 'GET' }
          );
          console.log(`[FAST2SMS DELIVERED] Status: ${response.status} to ${numbers}`);
        } catch (err: any) {
          console.error(`[FAST2SMS FAILED] Could not send SMS to ${target}:`, err.message);
        }
      } else if (twilioSid && twilioToken && twilioPhone) {
        try {
          const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
          const body = new URLSearchParams({
            To: target,
            From: twilioPhone,
            Body: `Smriti-Setu Health Portal — Your verification OTP code is: ${plainOTP}. Valid for 5 minutes.`,
          });
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
          });
          console.log(`[TWILIO SMS DELIVERED] Status: ${response.status} to ${target}`);
        } catch (err: any) {
          console.error(`[TWILIO SMS FAILED] Could not send SMS to ${target}:`, err.message);
        }
      } else {
        // Fallback Development Logger
        console.log(`\n======================================================`);
        console.log(`[DEVELOPMENT MOBILE SMS OTP] Sent to: ${target}`);
        console.log(`🔑 Verification Code: ${plainOTP}`);
        console.log(`⏳ Expires in 5 minutes`);
        console.log(`======================================================\n`);
      }
    }
  }
}

export const otpService = new OTPService();
