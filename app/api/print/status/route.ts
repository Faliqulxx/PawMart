import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ready",
    connected: true,
    bridge: "PawMart Internal Print Bridge",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
