import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { clientPromise, settingsDbName } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, from, tenantId } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Get tenant Gmail credentials
    let gmailUser, gmailAppPassword, gmailPhoneNumber;

    if (tenantId) {
      const client = await clientPromise;
      const settingsDb = client.db(settingsDbName);
      const tenant = await settingsDb.collection('Tenants').findOne({
        _id: new ObjectId(tenantId)
      }) as any;

      if (tenant && tenant.businessEmail && tenant.businessEmailPassword) {
        gmailUser = tenant.businessEmail;
        gmailAppPassword = tenant.businessEmailPassword;
        gmailPhoneNumber = tenant.phoneNumber;
      }
    }

    // Fallback to environment variables if tenant credentials not found
    if (!gmailUser || !gmailAppPassword) {
      throw new Error('Gmail credentials not found for the specified tenant');
    }

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        { error: 'Gmail credentials not configured' },
        { status: 500 }
      );
    }

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: from || gmailUser,
      to,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: (error as Error).message },
      { status: 500 }
    );
  }
}
