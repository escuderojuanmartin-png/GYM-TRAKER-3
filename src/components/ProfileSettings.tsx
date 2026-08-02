import React, { useState } from "react";
import { UserProfile } from "../types";
import { DataService } from "../services/dataService";
import { User, ShieldAlert, Save } from "lucide-react";

interface ProfileSettingsProps {
  userProfile: UserProfile | null;
  dataService: DataService;
  onProfileUpdated: (profile: UserProfile | null) => void;
}

export default function ProfileSettings({ userProfile, dataService, onProfileUpdated }: ProfileSettingsProps) {
  const [teacherEmail, setTeacherEmail] = useState(userProfile?.teacherId || "");
  const [loading, setLoading] = useState(false);

  if (!userProfile) return null;

  const handleSaveTeacherId = async () => {
    setLoading(true);
    try {
      const updatedProfile = { ...userProfile, teacherId: teacherEmail.trim() || null };
      await dataService.createUserProfile(updatedProfile); // Overwrites with new teacherId
      onProfileUpdated(updatedProfile);
      alert("Profesor vinculado correctamente.");
    } catch (e) {
      console.error(e);
      alert("Error al vincular profesor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRole = async () => {
    if (confirm("¿Estás seguro de que quieres restablecer tu rol? Tendrás que elegir de nuevo al entrar.")) {
      setLoading(true);
      try {
        // Just delete the user profile so they are prompted again
        // Note: we don't have a deleteUserProfile in DataService, so we'll just set the role to something invalid or we can just import deleteDoc here.
        // For simplicity, we can update the role to null if typescript allowed it, or we just write a quick raw firestore delete.
        // Actually, we can just delete it via dataService if we add it, but since we are trying to be quick:
        const { deleteDoc, doc, db } = await import("../firebase");
        await deleteDoc(doc(db, "users", userProfile.id));
        onProfileUpdated(null); // This will trigger the role selection screen in App.tsx
      } catch (e) {
        console.error(e);
        alert("Error al restablecer el rol.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-8 border-b-2 border-gym-border-light pb-4">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-neon-lime">
          PERFIL Y AJUSTES //
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
          Configuración de tu cuenta
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <div className="bg-gym-card border border-gym-border p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-gym-dark border-2 border-neon-lime rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-slate-400" />
            )}
          </div>
          <h3 className="text-xl font-black uppercase">{userProfile.name}</h3>
          <p className="text-xs text-slate-400 font-mono mb-4">{userProfile.email}</p>
          
          <div className="bg-gym-dark border border-gym-border w-full py-2 px-4 flex justify-between items-center mt-auto">
            <span className="text-[10px] font-black uppercase text-slate-500">ID de Usuario:</span>
            <span className="text-xs font-mono text-neon-lime">{userProfile.id}</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-mono">
            {userProfile.role === 'TEACHER' 
              ? 'Comparte este ID con tus alumnos para que te agreguen.' 
              : 'Este es tu identificador único en la plataforma.'}
          </p>
        </div>

        {/* Role & Links */}
        <div className="space-y-6">
          <div className="bg-gym-card border border-gym-border p-6">
            <h3 className="text-sm font-black uppercase text-white mb-4 border-b border-gym-border pb-2">
              Rol de la Cuenta
            </h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400 uppercase font-bold">Rol Actual:</span>
              <span className="text-xs font-black bg-neon-lime/20 text-neon-lime px-3 py-1 rounded-sm border border-neon-lime/30">
                {userProfile.role === 'TEACHER' ? 'PROFESOR' : 'ALUMNO'}
              </span>
            </div>
            
            <button
              onClick={handleResetRole}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-red-900/50 bg-red-950/20 hover:bg-red-950/40 text-red-500 py-3 text-xs font-black uppercase transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              Cambiar Rol
            </button>
            <p className="text-[9px] text-slate-500 mt-2 font-mono text-center">
              Si elegiste tu rol por accidente, puedes restablecerlo. 
            </p>
          </div>

          {userProfile.role === 'STUDENT' && (
            <div className="bg-gym-card border border-gym-border p-6">
              <h3 className="text-sm font-black uppercase text-white mb-4 border-b border-gym-border pb-2">
                Profesor Vinculado
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mb-4">
                Pega aquí el ID de tu profesor para recibir sus rutinas asignadas y permitirle ver tu evolución.
              </p>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="ID del Profesor"
                  className="w-full rounded-none border border-gym-border bg-gym-dark py-2.5 px-3 text-xs font-bold text-white focus:border-neon-lime focus:outline-none"
                />
                <button
                  onClick={handleSaveTeacherId}
                  disabled={loading || teacherEmail === userProfile.teacherId}
                  className="w-full flex items-center justify-center gap-2 bg-neon-lime text-black py-2.5 text-xs font-black uppercase hover:bg-white transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
