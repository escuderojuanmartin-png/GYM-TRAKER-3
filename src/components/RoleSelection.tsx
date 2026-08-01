import React, { useState } from "react";
import { User, Users, ChevronRight } from "lucide-react";
import { UserProfile } from "../types";
import { DataService } from "../services/dataService";
import type { User as FirebaseUser } from "firebase/auth";

interface RoleSelectionProps {
  user: FirebaseUser;
  dataService: DataService;
  onProfileCreated: (profile: UserProfile) => void;
}

export default function RoleSelection({ user, dataService, onProfileCreated }: RoleSelectionProps) {
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | null>(null);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);

    let teacherId: string | null = null;
    
    if (role === 'STUDENT' && teacherEmail.trim()) {
      teacherId = teacherEmail.trim(); // We'll assume the user enters the Teacher's UID for this prototype.
    }

    const newProfile: UserProfile = {
      id: user.uid,
      name: user.displayName || user.email?.split("@")[0] || "Usuario",
      email: user.email || "",
      role,
      teacherId,
      avatar: user.photoURL,
      createdAt: new Date().toISOString()
    };

    try {
      await dataService.createUserProfile(newProfile);
      onProfileCreated(newProfile);
    } catch (e) {
      alert("Error al crear el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gym-dark flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md p-8 border border-gym-border-light bg-gym-card shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-black uppercase tracking-wider mb-2">Selecciona tu Rol</h2>
        <p className="text-xs text-slate-400 mb-8 font-mono">Para configurar tu cuenta, indícanos cómo usarás GYM_TRACKER.</p>

        {!role ? (
          <div className="w-full space-y-4">
            <button
              onClick={() => setRole('STUDENT')}
              className="w-full flex items-center justify-between p-4 border-2 border-gym-border hover:border-neon-lime bg-gym-dark hover:bg-gym-card-light transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gym-card border border-gym-border flex items-center justify-center text-neon-lime">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Alumno / Deportista</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Registra tus entrenamientos y sigue rutinas.</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-neon-lime" />
            </button>

            <button
              onClick={() => setRole('TEACHER')}
              className="w-full flex items-center justify-between p-4 border-2 border-gym-border hover:border-neon-lime bg-gym-dark hover:bg-gym-card-light transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gym-card border border-gym-border flex items-center justify-center text-neon-lime">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Profesor / Entrenador</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Asigna rutinas y monitorea a tus alumnos.</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-neon-lime" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
            <div className="p-4 bg-gym-dark border border-gym-border text-center">
              <h3 className="text-sm font-black uppercase text-neon-lime mb-1">
                {role === 'STUDENT' ? 'Modo Alumno' : 'Modo Entrenador'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {role === 'STUDENT' ? 'Podrás vincularte a un profesor.' : 'Podrás invitar alumnos usando tu ID.'}
              </p>
            </div>

            {role === 'STUDENT' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                  ID del Profesor (Opcional)
                </label>
                <input
                  type="text"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Introduce el ID de tu profesor"
                  className="w-full rounded-none border border-gym-border bg-gym-dark py-2.5 px-3 text-xs font-bold text-white focus:border-neon-lime focus:outline-none"
                />
                <p className="text-[9px] text-slate-500 mt-2 font-mono">Si tu entrenador usa la app, pídele su ID de usuario y pégalo aquí.</p>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neon-lime text-black font-black uppercase tracking-widest py-3 hover:bg-neon-lime/90 transition-colors cursor-pointer"
              >
                {loading ? 'Guardando...' : 'Comenzar'}
              </button>
              <button
                type="button"
                onClick={() => setRole(null)}
                className="w-full bg-transparent text-slate-400 font-black uppercase tracking-widest py-2 hover:text-white transition-colors text-xs cursor-pointer"
              >
                Volver
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
