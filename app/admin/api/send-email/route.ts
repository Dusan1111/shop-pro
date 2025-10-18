import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from, businessEmailPassword } = await request.json();

    // Check if environment variables are set
    if (!from || !businessEmailPassword) {
      return NextResponse.json(
        { success: false, message: "Email credentials not configured" },
        { status: 500 }
      );
    }

    // Create a transporter - You'll need to configure this with your email service
    // For Gmail, you'll need to use an App Password (not your regular password)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for port 465
      auth: {
        user: from, // Your Gmail address
        pass: businessEmailPassword, // Your Gmail App Password
      },
    });

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
