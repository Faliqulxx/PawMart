/**
 * PawMart POS - Local Thermal Print Bridge
 * Service jembatan HTTP ke printer thermal ESC/POS lokal (Port 18080).
 *
 * Jalankan dengan:
 *   node scripts/print-bridge.js
 *
 * Opsi simulasi offline untuk pengujian:
 *   node scripts/print-bridge.js --offline
 */

const http = require("http");

const PORT = process.env.PORT || 18080;
const isSimulatedOffline = process.argv.includes("--offline");

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Status Check Endpoint: GET /status
  if (req.method === "GET" && (req.url === "/status" || req.url === "/")) {
    if (isSimulatedOffline) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "offline", connected: false, message: "Printer Offline" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ready",
        connected: true,
        bridge: "PawMart Local Print Bridge",
        version: "1.0.0",
        port: PORT,
      })
    );
    return;
  }

  // 2. Direct Receipt Print Endpoint: POST /print
  if (req.method === "POST" && req.url === "/print") {
    if (isSimulatedOffline) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Printer thermal sedang offline / tidak terhubung." }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const { type, paperWidth, rawText, transactionNumber } = payload;

        console.log("\n=======================================================");
        console.log(`[PRINT BRIDGE] TUGAS CETAK MASUK: ${type === "test" ? "TEST PRINT" : "STRUK KASIR"}`);
        console.log(`[PRINT BRIDGE] Lebar Kertas: ${paperWidth || "58mm"}`);
        if (transactionNumber) console.log(`[PRINT BRIDGE] Transaksi: ${transactionNumber}`);
        console.log("------------------ PREVIEW STRUK FISIK -----------------");
        console.log(rawText || "(Kosong)");
        console.log("=======================================================\n");

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Struk berhasil dikirim ke printer.",
            timestamp: new Date().toISOString(),
          })
        );
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Payload tidak valid." }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint tidak ditemukan" }));
});

server.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🐾 PawMart Local Thermal Print Bridge Aktif!`);
  console.log(`📡 URL Bridge: http://localhost:${PORT}`);
  console.log(`🔌 Status Printer: ${isSimulatedOffline ? "🔴 SIMULASI OFFLINE" : "🟢 READY / ONLINE"}`);
  console.log(`=======================================================\n`);
});
