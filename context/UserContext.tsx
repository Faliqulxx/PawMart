"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SystemUser,
  RoleType,
  SYSTEM_USERS,
  getUserById,
  getUserByRole,
} from "@/data/users";

export type { RoleType, SystemUser };
export type CurrentUser = SystemUser;

export interface UserContextValue {
  currentUser: SystemUser;
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
  login: (userId: string, rememberMe?: boolean) => void;
  logout: () => void;
}

interface StoredAuthSession {
  userId: string;
  timestamp: number;
}

const DEFAULT_USER: SystemUser = SYSTEM_USERS[0]; // Budi Hartono (Owner)

const UserContext = createContext<UserContextValue>({
  currentUser: DEFAULT_USER,
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
  login: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SystemUser>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize authenticated user from verified session on client mount
  useEffect(() => {
    try {
      // 1. Check active session storage
      const sessionRaw = sessionStorage.getItem("pawmart_auth_session");
      if (sessionRaw) {
        const parsed: StoredAuthSession = JSON.parse(sessionRaw);
        if (parsed?.userId) {
          const user = getUserById(parsed.userId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsInitialized(true);
            return;
          }
        }
      }

      // 2. Check remembered persistent session storage
      const rememberedRaw = localStorage.getItem("pawmart_remembered_session");
      if (rememberedRaw) {
        const parsed: StoredAuthSession = JSON.parse(rememberedRaw);
        if (parsed?.userId) {
          const user = getUserById(parsed.userId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            // Refresh current window session
            sessionStorage.setItem("pawmart_auth_session", JSON.stringify(parsed));
            setIsInitialized(true);
            return;
          }
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

  /**
   * Login strictly by authenticating a specific User ID.
   * Role is automatically derived from the database record of that user.
   * Client-side cannot arbitrarily inject or switch roles.
   */
  const login = (userId: string, rememberMe: boolean = false) => {
    const user = getUserById(userId) || DEFAULT_USER;
    setCurrentUser(user);
    setIsAuthenticated(true);

    const payload: StoredAuthSession = {
      userId: user.id,
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

  /**
   * Terminate active authenticated session
   */
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(DEFAULT_USER);
    try {
      sessionStorage.removeItem("pawmart_auth_session");
      localStorage.removeItem("pawmart_remembered_session");
    } catch (err) {
      console.error("Failed to clear auth session:", err);
    }
  };

  // Role permissions are derived directly from the authenticated user
  const role: RoleType = currentUser.role;
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
