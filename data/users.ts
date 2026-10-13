export type RoleType = "admin" | "kasir" | "groomer";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  roleLabel: string;
  avatar: string;
  phone?: string;
  description?: string;
}

export const SYSTEM_USERS: SystemUser[] = [
  {
    id: "USR-001",
    name: "Budi Hartono",
    email: "owner@pawmart.id",
    role: "admin",
    roleLabel: "Admin / Owner Toko",
    avatar: "👑",
    phone: "0812-3456-7890",
    description: "Pemilik & Administrator Utama PawMart POS",
  },
  {
    id: "USR-002",
    name: "Maya Kasir",
    email: "kasir@pawmart.id",
    role: "kasir",
    roleLabel: "Kasir / Karyawan",
    avatar: "👤",
    phone: "0813-9876-5432",
    description: "Staf Kasir & Pelayanan Pembayaran POS",
  },
  {
    id: "USR-003",
    name: "Rifki Groomer",
    email: "groomer@pawmart.id",
    role: "groomer",
    roleLabel: "Staff Grooming & Care",
    avatar: "✂️",
    phone: "0815-5555-1234",
    description: "Staf Perawatan & Grooming Anabul",
  },
];

export function getUserById(id: string): SystemUser | null {
  return SYSTEM_USERS.find((u) => u.id === id) || null;
}

export function getUserByEmailOrUsername(query: string): SystemUser | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Exact email match
  const byEmail = SYSTEM_USERS.find((u) => u.email.toLowerCase() === q);
  if (byEmail) return byEmail;

  // Keyword match
  if (q.includes("groomer") || q.includes("rifki") || q.includes("cukur") || q.includes("perawat")) {
    return SYSTEM_USERS.find((u) => u.role === "groomer") || null;
  }
  if (q.includes("kasir") || q.includes("staff") || q.includes("karyawan") || q.includes("maya") || q.includes("cashier")) {
    return SYSTEM_USERS.find((u) => u.role === "kasir") || null;
  }
  if (q.includes("owner") || q.includes("admin") || q.includes("budi") || q.includes("bos")) {
    return SYSTEM_USERS.find((u) => u.role === "admin") || null;
  }

  // Fallback: match prefix email
  const byPrefix = SYSTEM_USERS.find((u) => u.email.split("@")[0].toLowerCase() === q);
  if (byPrefix) return byPrefix;

  // Default fallback if generic username entered
  return SYSTEM_USERS[0];
}

export function getUserByRole(role: RoleType): SystemUser {
  return SYSTEM_USERS.find((u) => u.role === role) || SYSTEM_USERS[0];
}
