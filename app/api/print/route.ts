import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, paperWidth, transactionNumber, rawText, timestamp } = body;

    // Log penerimaan ke server log print bridge
    console.log(`[PAWMART PRINT BRIDGE] Menerima tugas cetak: ${type || "receipt"} | Kertas: ${paperWidth || "58mm"}`);
    if (transactionNumber) {
      console.log(`[PAWMART PRINT BRIDGE] Transaksi: ${transactionNumber}`);
    }

    return NextResponse.json({
      success: true,
      message: type === "test" ? "Test print berhasil diproses." : "Struk berhasil dikirim ke printer.",
      transactionNumber,
      timestamp: timestamp || new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses data struk di print service: " + (error?.message || "Format tidak valid"),
      },
      { status: 400 }
    );
  }
}
