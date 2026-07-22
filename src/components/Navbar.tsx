import React from "react";
import { LogIn, LogOut, Dumbbell, Cloud, CloudOff, Info } from "lucide-react";
import type { User } from "firebase/auth";

interface NavbarProps {
  user: User | null;
  loadingAuth: boolean;
  onLogin: () => void;
  onLogout: () => void;
  hasLocalData: boolean;
  onMigrate: () => void;
}

export default function Navbar({
  user,
  loadingAuth,
  onLogin,
  onLogout,
  hasLocalData,
  onMigrate
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-gym-border-light bg-gym-dark/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-neon-lime text-black font-black shadow-lg">
            <Dumbbell className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white uppercase sm:text-xl">
              GYM_TRACKER //
            </h1>
            <p className="hidden text-xxs font-bold text-neon-lime tracking-wider uppercase sm:block">
              PROGRESO DE FUERZA ESTRUCTURADO
            </p>
          </div>
        </div>

        {/* Sync Status & Authentication */}
        <div className="flex items-center gap-3">
          
          {/* Cloud Sync State Badge */}
          {loadingAuth ? (
            <div className="h-4 w-20 animate-pulse bg-gym-card-light" />
          ) : user ? (
            <div className="hidden items-center gap-1.5 rounded-sm bg-emerald-950/30 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-900 md:flex uppercase tracking-wider">
              <Cloud className="h-3.5 w-3.5 text-emerald-400" />
              <span>Nube Sincronizada</span>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 rounded-sm bg-amber-950/30 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-900 md:flex uppercase tracking-wider">
              <CloudOff className="h-3.5 w-3.5 text-amber-400" />
              <span>Modo Local (Offline)</span>
            </div>
          )}

          {/* Local Data Migration Callout */}
          {!user && hasLocalData && (
            <button
              onClick={onMigrate}
              className="flex items-center gap-1 rounded-sm bg-neon-lime/10 px-2.5 py-1 text-xs font-bold text-neon-lime border border-neon-lime/30 hover:bg-neon-lime/20 transition-all cursor-pointer uppercase tracking-wider"
              title="Tienes datos en modo local. ¡Inicia sesión para sincronizarlos!"
            >
              <Info className="h-3.5 w-3.5 text-neon-lime" />
              <span>Sincronizar Datos</span>
            </button>
          )}

          {/* User Details & Login Button */}
          {loadingAuth ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-gym-card-light" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black text-white truncate max-w-[150px] uppercase">
                  {user.displayName || "Usuario"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                  {user.email}
                </p>
              </div>
              
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  referrerPolicy="no-referrer"
                  alt={user.displayName || "Avatar"}
                  className="h-9 w-9 rounded-none object-cover border-2 border-gym-border-light shadow-inner"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center bg-gym-card-light font-black text-white border-2 border-gym-border-light text-sm">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <button
                onClick={onLogout}
                className="flex h-9 w-9 items-center justify-center border-2 border-gym-border-light text-slate-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/20 transition-all cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 bg-white px-4 py-2 text-xs font-black text-black hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider rounded-sm"
            >
              <LogIn className="h-4 w-4 stroke-[2.5]" />
              <span>Inicia con Google</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
