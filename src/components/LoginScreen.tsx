import React, { useState } from "react";
import { LogIn, Dumbbell, CloudOff, Mail, Key, UserPlus } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
  onEmailLogin: (email: string, pass: string) => void;
  onEmailSignUp: (email: string, pass: string) => void;
  loadingAuth: boolean;
  onContinueOffline: () => void;
}

export default function LoginScreen({ 
  onLogin, 
  onEmailLogin,
  onEmailSignUp,
  loadingAuth, 
  onContinueOffline 
}: LoginScreenProps) {
  const [useEmailMode, setUseEmailMode] = useState(false);
  const [email, setEmail] = useState("escuderojuanmartin@gmail.com");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Por favor introduce tu correo electrónico y contraseña.");
      return;
    }
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (isSignUp) {
      onEmailSignUp(email.trim(), password);
    } else {
      onEmailLogin(email.trim(), password);
    }
  };

  return (
    <div className="min-h-screen bg-gym-dark flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md p-8 border border-gym-border-light bg-gym-card shadow-2xl flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center bg-neon-lime text-black font-black shadow-lg mb-6">
          <Dumbbell className="h-8 w-8 stroke-[2.5]" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase mb-2">
          GYM_TRACKER //
        </h1>
        
        <p className="text-sm font-medium text-slate-400 mb-8 uppercase tracking-widest leading-relaxed">
          Progreso de fuerza estructurado.<br />
          Registra tus sesiones. Supera tus marcas.
        </p>

        {!useEmailMode ? (
          <div className="w-full space-y-3">
            {/* Google Sign-in button */}
            <button
              onClick={onLogin}
              disabled={loadingAuth}
              className="w-full flex items-center justify-center gap-3 bg-white px-6 py-3.5 text-xs font-black text-black hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50 border-2 border-transparent"
            >
              {loadingAuth ? (
                <div className="h-5 w-5 animate-spin-slow rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <LogIn className="h-4 w-4 stroke-[2.5]" />
              )}
              <span>Continuar con Google</span>
            </button>

            {/* Email Mode Toggle Button */}
            <button
              onClick={() => setUseEmailMode(true)}
              className="w-full flex items-center justify-center gap-2 border border-gym-border bg-gym-dark hover:bg-gym-card-light px-6 py-3.5 text-xs font-black text-white transition-all cursor-pointer uppercase tracking-wider"
            >
              <Mail className="h-4 w-4 text-neon-lime" />
              <span>Ingresar con Correo / Contraseña</span>
            </button>
          </div>
        ) : (
          /* Email / Password Form */
          <form onSubmit={handleSubmitEmail} className="w-full space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-none border border-gym-border bg-gym-dark py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-slate-600 focus:border-neon-lime focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                Contraseña
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-none border border-gym-border bg-gym-dark py-2.5 pl-10 pr-3 text-xs font-bold text-white placeholder-slate-600 focus:border-neon-lime focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loadingAuth}
                className="w-full flex items-center justify-center gap-2 bg-neon-lime hover:bg-neon-lime/90 px-6 py-3.5 text-xs font-black text-black cursor-pointer uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loadingAuth ? (
                  <div className="h-5 w-5 animate-spin-slow rounded-full border-2 border-black border-t-transparent" />
                ) : isSignUp ? (
                  <>
                    <UserPlus className="h-4 w-4 stroke-[3]" />
                    <span>Crear Cuenta e Ingresar</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 stroke-[3]" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xxs font-mono uppercase tracking-wider text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="hover:text-neon-lime transition-colors cursor-pointer underline"
                >
                  {isSignUp ? "¿Ya tienes cuenta? Iniciar Sesión" : "¿No tienes cuenta? Registrarse"}
                </button>

                <button
                  type="button"
                  onClick={() => setUseEmailMode(false)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Volver
                </button>
              </div>
            </div>
          </form>
        )}
        
        <button
          onClick={onContinueOffline}
          className="w-full mt-5 flex items-center justify-center gap-2 bg-transparent text-slate-400 hover:text-white px-4 py-3 text-xs font-black transition-colors cursor-pointer uppercase tracking-wider border-t border-gym-border/40"
        >
          <CloudOff className="h-4 w-4" />
          <span>Probar sin conexión</span>
        </button>

        <p className="mt-6 text-[10px] text-slate-500 font-medium max-w-xs uppercase tracking-widest">
          Información guardada de forma segura.
        </p>
      </div>
    </div>
  );
}
