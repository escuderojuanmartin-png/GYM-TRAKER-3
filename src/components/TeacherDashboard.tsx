import React, { useState, useEffect } from "react";
import { UserProfile, Routine, Exercise, MuscleGroup, Workout } from "../types";
import { DataService } from "../services/dataService";
import { Users, Activity, Plus, Dumbbell, LogOut } from "lucide-react";
import StatsView from "./StatsView";

interface TeacherDashboardProps {
  userProfile: UserProfile;
  dataService: DataService;
  onLogout: () => void;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  onResetRole?: () => void;
}

export default function TeacherDashboard({ userProfile, dataService, onLogout, exercises, muscleGroups, onResetRole }: TeacherDashboardProps) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Student specific data for viewing stats
  const [studentWorkouts, setStudentWorkouts] = useState<Workout[]>([]);
  const [studentService, setStudentService] = useState<DataService | null>(null);

  useEffect(() => {
    loadStudents();
  }, [userProfile]);

  const loadStudents = async () => {
    setLoading(true);
    const result = await dataService.getStudentsForTeacher();
    setStudents(result);
    setLoading(false);
  };

  const handleSelectStudent = async (student: UserProfile) => {
    setSelectedStudent(student);
    // Create a temporary data service scoped to this student's ID
    const sService = new DataService(student.id);
    setStudentService(sService);
    
    // Load student's workouts to display stats
    const wks = await sService.getWorkouts();
    setStudentWorkouts(wks);
  };

  return (
    <div className="min-h-screen bg-gym-dark text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gym-card border-r border-gym-border flex flex-col">
        <div className="p-4 border-b border-gym-border flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase text-neon-lime tracking-tighter">
              TEACHER_PRO //
            </h1>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Tu ID: {userProfile.id}</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Mis Alumnos
          </h2>

          {loading ? (
            <div className="text-xs text-slate-400">Cargando...</div>
          ) : students.length === 0 ? (
            <div className="text-[10px] text-slate-400 font-mono border border-gym-border/50 p-3 bg-gym-dark text-center">
              Aún no tienes alumnos. Diles que ingresen tu ID ({userProfile.id}) al registrarse.
            </div>
          ) : (
            <div className="space-y-2">
              {students.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className={`w-full text-left p-3 border ${selectedStudent?.id === student.id ? 'border-neon-lime bg-gym-card-light' : 'border-gym-border hover:border-slate-500 bg-gym-dark'} transition-colors flex items-center gap-3`}
                >
                  <div className="h-8 w-8 rounded-full bg-gym-card flex items-center justify-center border border-gym-border">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase truncate">{student.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono truncate">{student.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gym-border space-y-2">
          {onResetRole && (
            <button
              onClick={onResetRole}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors uppercase tracking-wider"
            >
              Cambiar Rol
            </button>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gym-dark flex flex-col">
        {!selectedStudent ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
            <Activity className="h-16 w-16 mb-4 text-slate-600 stroke-[1.5]" />
            <h2 className="text-xl font-black uppercase tracking-wider mb-2">Panel de Control</h2>
            <p className="text-xs text-slate-400 font-mono max-w-sm">
              Selecciona un alumno del panel lateral para ver sus estadísticas, progresión de cargas o asignarle una rutina.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 border-b border-gym-border bg-gym-card-light flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider">{selectedStudent.name}</h2>
                <p className="text-xs text-slate-400 font-mono">Evolución e Historial</p>
              </div>
              <button
                onClick={() => alert("Próximamente: Crear rutina para " + selectedStudent.name)}
                className="flex items-center gap-2 bg-neon-lime px-4 py-2 text-xs font-black text-black uppercase tracking-wider hover:bg-white transition-colors"
              >
                <Plus className="h-4 w-4" /> Asignar Rutina
              </button>
            </div>

            <div className="p-4">
              {studentService && (
                <StatsView 
                  workouts={studentWorkouts} 
                  exercises={exercises} 
                  muscleGroups={muscleGroups} 
                  dataService={studentService} 
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
