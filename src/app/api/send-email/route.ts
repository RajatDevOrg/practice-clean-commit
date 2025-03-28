import { NextResponse } from "next/server";
import sendSimpleMessage from "../../../../lib/mailgun";

export async function POST() {
  try {
    await sendSimpleMessage();
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to send email", error },
      { status: 500 }
    );
  }
}
