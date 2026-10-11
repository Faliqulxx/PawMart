"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleType = "admin" | "kasir" | "groomer";

export interface CurrentUser {
  id: string;
  name: string;
  role: RoleType;
  roleLabel: string;
  email: string;
  avatar: string;
}

export interface UserContextValue {
  currentUser: CurrentUser;
  role: RoleType;
  isAdmin: boolean;
  isKasir: boolean;
  isGroomer: boolean;
  canManageProducts: boolean;
  canManageStock: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageServices: boolean;
  canCashierPOS: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  switchRole: (role: RoleType) => void;
  login: (
    role?: RoleType,
    customDetails?: { name?: string; email?: string },
    rememberMe?: boolean
  ) => void;
  logout: () => void;
}

const ADMIN_USER: CurrentUser = {
  id: "USER-001",
  name: "Budi Hartono (Owner)",
  role: "admin",
  roleLabel: "Admin / Owner Toko",
  email: "owner@pawmart.id",
  avatar: "👑",
};

const KASIR_USER: CurrentUser = {
  id: "USER-002",
  name: "Maya Kasir (Karyawan)",
  role: "kasir",
  roleLabel: "Kasir / Karyawan",
  email: "kasir@pawmart.id",
  avatar: "👩‍💼",
};

const GROOMER_USER: CurrentUser = {
  id: "USER-003",
  name: "Rifki Groomer (Staff)",
  role: "groomer",
  roleLabel: "Staff Grooming & Care",
  email: "groomer@pawmart.id",
  avatar: "✂️",
};

const UserContext = createContext<UserContextValue>({
  currentUser: ADMIN_USER,
  role: "admin",
  isAdmin: true,
  isKasir: false,
  isGroomer: false,
  canManageProducts: true,
  canManageStock: true,
  canViewReports: true,
  canManageSettings: true,
  canManageServices: true,
  canCashierPOS: true,
  isAuthenticated: false,
  isInitialized: false,
  switchRole: () => {},
  login: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<RoleType>("admin");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [customUser, setCustomUser] = useState<{ name?: string; email?: string } | null>(null);

  // Initialize from sessionStorage (or localStorage if remembered) on client mount
  useEffect(() => {
    try {
      const sessionData = sessionStorage.getItem("pawmart_auth_session");
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed?.isAuthenticated) {
          setIsAuthenticated(true);
          if (parsed.role === "admin" || parsed.role === "kasir" || parsed.role === "groomer") {
            setRole(parsed.role);
          }
          if (parsed.customName || parsed.customEmail) {
            setCustomUser({ name: parsed.customName, email: parsed.customEmail });
          }
          setIsInitialized(true);
          return;
        }
      }

      const rememberedData = localStorage.getItem("pawmart_remembered_session");
      if (rememberedData) {
        const parsed = JSON.parse(rememberedData);
        if (parsed?.isAuthenticated) {
          setIsAuthenticated(true);
          if (parsed.role === "admin" || parsed.role === "kasir" || parsed.role === "groomer") {
            setRole(parsed.role);
          }
          if (parsed.customName || parsed.customEmail) {
            setCustomUser({ name: parsed.customName, email: parsed.customEmail });
          }
          setIsInitialized(true);
          return;
        }
      }

      // No active session found -> requires login
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Auth session parse error:", err);
      setIsAuthenticated(false);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (
    targetRole: RoleType = "admin",
    customDetails?: { name?: string; email?: string },
    rememberMe: boolean = false
  ) => {
    setRole(targetRole);
    if (customDetails?.name || customDetails?.email) {
      setCustomUser(customDetails);
    } else {
      setCustomUser(null);
    }
    setIsAuthenticated(true);

    const payload = {
      isAuthenticated: true,
      role: targetRole,
      customName: customDetails?.name,
      customEmail: customDetails?.email,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem("pawmart_auth_session", JSON.stringify(payload));
      if (rememberMe) {
        localStorage.setItem("pawmart_remembered_session", JSON.stringify(payload));
      } else {
        localStorage.removeItem("pawmart_remembered_session");
      }
    } catch (err) {
      console.error("Failed to store auth session:", err);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCustomUser(null);
    try {
      sessionStorage.removeItem("pawmart_auth_session");
      localStorage.removeItem("pawmart_remembered_session");
    } catch (err) {
      console.error("Failed to clear auth session:", err);
    }
  };

  const switchRole = (newRole: RoleType) => {
    setRole(newRole);
    try {
      const raw = sessionStorage.getItem("pawmart_auth_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.role = newRole;
        sessionStorage.setItem("pawmart_auth_session", JSON.stringify(parsed));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const baseUser =
    role === "admin"
      ? ADMIN_USER
      : role === "groomer"
      ? GROOMER_USER
      : KASIR_USER;

  const currentUser: CurrentUser = {
    ...baseUser,
    name: customUser?.name || baseUser.name,
    email: customUser?.email || baseUser.email,
  };

  // Granular role permissions
  const isAdmin = role === "admin";
  const isKasir = role === "kasir";
  const isGroomer = role === "groomer";

  const canManageProducts = isAdmin;
  const canManageStock = isAdmin;
  const canViewReports = isAdmin;
  const canManageSettings = isAdmin;
  const canManageServices = isAdmin;
  const canCashierPOS = isAdmin || isKasir;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        role,
        isAdmin,
        isKasir,
        isGroomer,
        canManageProducts,
        canManageStock,
        canViewReports,
        canManageSettings,
        canManageServices,
        canCashierPOS,
        isAuthenticated,
        isInitialized,
        switchRole,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserContext);
}
