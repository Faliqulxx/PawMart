/**
 * Format angka ke format mata uang Rupiah Indonesia
 * Contoh: 2450000 -> "Rp 2.450.000"
 */
export function formatRupiah(amount: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rp ${formatted}`;
}

/**
 * Format string tanggal (YYYY-MM-DD atau ISO) ke format Indonesia "18 Okt 2025"
 */
export function formatTanggal(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format tanggal dan waktu "18 Okt 2025, 14:30"
 */
export function formatDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const dateStr = formatTanggal(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${dateStr}, ${hours}:${minutes}`;
}
