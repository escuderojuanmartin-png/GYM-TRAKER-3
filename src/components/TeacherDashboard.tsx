import React, { useState, useEffect } from "react";
import { UserProfile, Routine, Exercise, MuscleGroup, Workout } from "../types";
import { DataService } from "../services/dataService";
import { Users, Activity, Plus, Dumbbell, LogOut, X, Check } from "lucide-react";
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

  // Routine assignment state
  const [isAssigningRoutine, setIsAssigningRoutine] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedMuscleGroupIds, setSelectedMuscleGroupIds] = useState<string[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [savingRoutine, setSavingRoutine] = useState(false);

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
    setIsAssigningRoutine(false);
  };

  const handleToggleMuscleGroup = (id: string) => {
    setSelectedMuscleGroupIds(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleToggleExercise = (id: string) => {
    setSelectedExerciseIds(prev => 
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const handleAssignRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !routineName.trim() || selectedExerciseIds.length === 0) return;
    
    setSavingRoutine(true);
    try {
      await dataService.assignRoutineToStudent(selectedStudent.id, routineName.trim(), selectedExerciseIds, selectedMuscleGroupIds);
      setIsAssigningRoutine(false);
      setRoutineName("");
      setSelectedMuscleGroupIds([]);
      setSelectedExerciseIds([]);
      alert("Rutina asignada exitosamente a " + selectedStudent.name);
    } catch (e) {
      alert("Error al asignar rutina.");
      console.error(e);
    } finally {
      setSavingRoutine(false);
    }
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
                <p className="text-xs text-slate-400 font-mono">
                  {isAssigningRoutine ? "Asignando Nueva Rutina" : "Evolución e Historial"}
                </p>
              </div>
              
              {!isAssigningRoutine ? (
                <button
                  onClick={() => setIsAssigningRoutine(true)}
                  className="flex items-center gap-2 bg-neon-lime px-4 py-2 text-xs font-black text-black uppercase tracking-wider hover:bg-white transition-colors"
                >
                  <Plus className="h-4 w-4" /> Asignar Rutina
                </button>
              ) : (
                <button
                  onClick={() => setIsAssigningRoutine(false)}
                  className="flex items-center gap-2 border border-gym-border px-4 py-2 text-xs font-black text-white uppercase tracking-wider hover:bg-gym-card transition-colors"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              )}
            </div>

            <div className="p-4">
              {isAssigningRoutine ? (
                <div className="max-w-2xl mx-auto border-2 border-gym-border bg-gym-card p-6 shadow-xl">
                  <h3 className="text-lg font-black uppercase tracking-widest text-neon-lime mb-6 border-b border-gym-border pb-2">
                    Crear Rutina Asignada
                  </h3>
                  
                  <form onSubmit={handleAssignRoutine} className="space-y-6">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Nombre de la Rutina
                      </label>
                      <input
                        type="text"
                        value={routineName}
                        onChange={(e) => setRoutineName(e.target.value)}
                        placeholder="Ej. Día 1: Pecho y Tríceps"
                        className="w-full rounded-none border-2 border-gym-border bg-gym-dark px-4 py-3 text-sm font-bold text-white placeholder-slate-600 focus:border-neon-lime focus:outline-none"
                        required
                        maxLength={40}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">
                        Selecciona los Ejercicios (Solo Base)
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {muscleGroups.map(group => {
                          // Only include base exercises (userId === null) to ensure students can see them
                          const groupExercises = exercises.filter(e => e.muscleGroupId === group.id && e.userId === null);
                          
                          if (groupExercises.length === 0) return null;
                          
                          return (
                            <div key={group.id} className="border border-gym-border bg-gym-dark p-3 space-y-2">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-neon-lime flex justify-between">
                                {group.name}
                                <input 
                                  type="checkbox"
                                  checked={selectedMuscleGroupIds.includes(group.id)}
                                  onChange={() => handleToggleMuscleGroup(group.id)}
                                  className="accent-neon-lime cursor-pointer"
                                />
                              </h5>

                              <div className="space-y-1.5 pl-2 border-l-2 border-gym-border">
                                {groupExercises.map(ex => {
                                  const isSelected = selectedExerciseIds.includes(ex.id);
                                  return (
                                    <button
                                      type="button"
                                      key={ex.id}
                                      onClick={() => handleToggleExercise(ex.id)}
                                      className={`flex w-full items-center justify-between rounded-none px-2 py-1.5 text-left text-xs font-bold uppercase transition-all cursor-pointer ${
                                        isSelected 
                                          ? "bg-neon-lime/10 text-neon-lime" 
                                          : "text-slate-400 hover:text-white"
                                      }`}
                                    >
                                      <span className="truncate max-w-[150px]">{ex.name}</span>
                                      <div className={`h-4 w-4 flex flex-shrink-0 items-center justify-center border transition-all ${
                                        isSelected ? "bg-neon-lime border-neon-lime text-black" : "border-gym-border bg-gym-dark"
                                      }`}>
                                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gym-border">
                      <button
                        type="submit"
                        disabled={savingRoutine || selectedExerciseIds.length === 0 || !routineName.trim()}
                        className="rounded-none bg-neon-lime hover:bg-[#bce600] px-6 py-3 text-xs font-black uppercase tracking-widest text-black cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {savingRoutine ? "Guardando..." : "Asignar Rutina"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                studentService && (
                  <StatsView 
                    workouts={studentWorkouts} 
                    exercises={exercises} 
                    muscleGroups={muscleGroups} 
                    dataService={studentService} 
                  />
                )
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
