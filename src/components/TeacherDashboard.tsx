import React, { useState, useEffect } from "react";
import { UserProfile, Routine, Exercise, MuscleGroup, Workout } from "../types";
import { DataService } from "../services/dataService";
import { Users, Activity, Plus, Check, X, Search, ChevronRight, Copy } from "lucide-react";
import StatsView from "./StatsView";

interface TeacherDashboardProps {
  userProfile: UserProfile;
  dataService: DataService;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  teacherRoutines: Routine[];
}

export default function TeacherDashboard({ userProfile, dataService, exercises, muscleGroups, teacherRoutines }: TeacherDashboardProps) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Student specific data for viewing stats
  const [studentWorkouts, setStudentWorkouts] = useState<Workout[]>([]);
  const [studentRoutines, setStudentRoutines] = useState<Routine[]>([]);
  const [studentService, setStudentService] = useState<DataService | null>(null);

  // Routine assignment state
  const [isAssigningRoutine, setIsAssigningRoutine] = useState(false);
  const [assignMode, setAssignMode] = useState<'NEW' | 'TEMPLATE'>('NEW');
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
    
    // Load student's workouts and routines to display stats and assigned routines
    const [wks, rts] = await Promise.all([
      sService.getWorkouts(),
      sService.getRoutines()
    ]);
    setStudentWorkouts(wks);
    setStudentRoutines(rts);
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

  const handleAssignNewRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !routineName.trim() || selectedExerciseIds.length === 0) return;
    
    setSavingRoutine(true);
    try {
      await dataService.assignRoutineToStudent(selectedStudent.id, routineName.trim(), selectedExerciseIds, selectedMuscleGroupIds);
      alert("Rutina asignada exitosamente a " + selectedStudent.name);
      // Reload student data
      await handleSelectStudent(selectedStudent);
    } catch (e) {
      alert("Error al asignar rutina.");
      console.error(e);
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleAssignFromTemplate = async (routine: Routine) => {
    if (!selectedStudent) return;
    if (confirm(`¿Asignar "${routine.name}" a ${selectedStudent.name}?`)) {
      setSavingRoutine(true);
      try {
        await dataService.assignRoutineToStudent(selectedStudent.id, routine.name, routine.exerciseIds, routine.muscleGroupIds);
        alert("Plantilla asignada exitosamente.");
        await handleSelectStudent(selectedStudent);
      } catch (e) {
        alert("Error al asignar plantilla.");
        console.error(e);
      } finally {
        setSavingRoutine(false);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:flex-row border-2 border-gym-border-light bg-gym-dark overflow-hidden shadow-xl">
      {/* Sidebar: Student List */}
      <div className="w-full md:w-64 bg-gym-card border-r-2 border-gym-border flex flex-col shrink-0">
        <div className="p-4 border-b border-gym-border">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Users className="h-4 w-4" /> Mis Alumnos
          </h2>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-xs text-slate-400">Cargando alumnos...</div>
          ) : students.length === 0 ? (
            <div className="text-[10px] text-slate-400 font-mono border border-gym-border/50 p-3 bg-gym-dark text-center">
              Aún no tienes alumnos. Diles que ingresen tu ID ({userProfile.id}) al registrarse.
            </div>
          ) : (
            students.map(student => (
              <button
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className={`w-full text-left p-3 border-2 ${selectedStudent?.id === student.id ? 'border-neon-lime bg-neon-lime/5' : 'border-gym-border hover:border-slate-500 bg-gym-dark'} transition-colors flex items-center gap-3`}
              >
                <div className="h-8 w-8 rounded-none bg-gym-card-light flex items-center justify-center border border-gym-border shrink-0 overflow-hidden">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.name || 'Alumno'} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-black text-[10px]">{student.name?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold uppercase truncate">{student.name}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{student.email}</div>
                </div>
                <ChevronRight className={`h-4 w-4 ${selectedStudent?.id === student.id ? 'text-neon-lime' : 'text-transparent'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gym-dark flex flex-col min-w-0 overflow-y-auto">
        {!selectedStudent ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
            <Activity className="h-16 w-16 mb-4 text-slate-600 stroke-[1.5]" />
            <h2 className="text-xl font-black uppercase tracking-wider mb-2">Panel de Control de Alumnos</h2>
            <p className="text-xs text-slate-400 font-mono max-w-sm">
              Selecciona un alumno del panel lateral para ver sus estadísticas, rutinas asignadas y progresión.
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="p-6 border-b-2 border-gym-border-light bg-gym-card-light flex justify-between items-center flex-wrap gap-4 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider">{selectedStudent.name}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {isAssigningRoutine ? "Modo Asignación" : "Gestión y Evolución"}
                </p>
              </div>
              
              {!isAssigningRoutine ? (
                <button
                  onClick={() => setIsAssigningRoutine(true)}
                  className="flex items-center gap-2 bg-neon-lime px-4 py-2 text-xs font-black text-black uppercase tracking-wider hover:bg-white transition-colors cursor-pointer shadow-lg shadow-neon-lime/20"
                >
                  <Plus className="h-4 w-4 stroke-[3]" /> Asignar Rutina
                </button>
              ) : (
                <button
                  onClick={() => setIsAssigningRoutine(false)}
                  className="flex items-center gap-2 border-2 border-gym-border-light px-4 py-2 text-xs font-black text-white uppercase tracking-wider hover:bg-gym-card transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              )}
            </div>

            <div className="p-4 md:p-6 flex-1">
              {isAssigningRoutine ? (
                <div className="max-w-3xl mx-auto border-2 border-gym-border-light bg-gym-card p-6 shadow-xl animate-fade-in">
                  
                  {/* Tabs for assigning mode */}
                  <div className="flex gap-4 border-b-2 border-gym-border mb-6">
                    <button
                      onClick={() => setAssignMode('NEW')}
                      className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors ${assignMode === 'NEW' ? 'text-neon-lime border-b-2 border-neon-lime' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Crear Desde Cero
                    </button>
                    <button
                      onClick={() => setAssignMode('TEMPLATE')}
                      className={`pb-2 text-xs font-black uppercase tracking-widest transition-colors ${assignMode === 'TEMPLATE' ? 'text-neon-lime border-b-2 border-neon-lime' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Copiar de Mis Plantillas
                    </button>
                  </div>

                  {assignMode === 'TEMPLATE' ? (
                    <div className="space-y-4">
                      {teacherRoutines.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-gym-border text-slate-400 text-xs font-mono">
                          No tienes plantillas creadas. Ve a la pestaña "Plantillas" para crear rutinas base.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {teacherRoutines.map(routine => (
                            <div key={routine.id} className="border border-gym-border bg-gym-dark p-4 hover:border-neon-lime transition-colors group">
                              <h4 className="text-sm font-black uppercase text-white mb-1">{routine.name}</h4>
                              <p className="text-[10px] text-slate-500 font-mono mb-4">{routine.exerciseIds.length} ejercicios</p>
                              <button
                                onClick={() => handleAssignFromTemplate(routine)}
                                disabled={savingRoutine}
                                className="w-full flex items-center justify-center gap-2 bg-gym-card-light border border-gym-border py-2 text-xs font-bold uppercase hover:bg-neon-lime hover:text-black hover:border-neon-lime transition-colors disabled:opacity-50"
                              >
                                <Copy className="h-4 w-4" /> Asignar esta rutina
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleAssignNewRoutine} className="space-y-6">
                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                          Nombre de la Rutina
                        </label>
                        <input
                          type="text"
                          value={routineName}
                          onChange={(e) => setRoutineName(e.target.value)}
                          placeholder="Ej. Día 1: Pecho y Tríceps"
                          className="w-full rounded-none border-2 border-gym-border bg-gym-dark px-4 py-3 text-sm font-bold text-white placeholder-slate-600 focus:border-neon-lime focus:outline-none transition-colors"
                          required
                          maxLength={40}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">
                          Selecciona los Ejercicios (Base + Tuyos)
                        </label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {muscleGroups.map(group => {
                            // Include base exercises and teacher's own custom exercises!
                            const groupExercises = exercises.filter(e => e.muscleGroupId === group.id && (e.userId === null || e.userId === userProfile.id));
                            
                            if (groupExercises.length === 0) return null;
                            
                            return (
                              <div key={group.id} className="border-2 border-gym-border bg-gym-dark p-3 space-y-2">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-neon-lime flex justify-between items-center">
                                  {group.name}
                                  <input 
                                    type="checkbox"
                                    checked={selectedMuscleGroupIds.includes(group.id)}
                                    onChange={() => handleToggleMuscleGroup(group.id)}
                                    className="accent-neon-lime cursor-pointer h-4 w-4"
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
                                            ? "bg-neon-lime/10 text-neon-lime border border-neon-lime/30" 
                                            : "text-slate-400 hover:text-white border border-transparent"
                                        }`}
                                      >
                                        <span className="truncate max-w-[150px]">{ex.name}</span>
                                        <div className={`h-4 w-4 flex flex-shrink-0 items-center justify-center border transition-all ${
                                          isSelected ? "bg-neon-lime border-neon-lime text-black" : "border-gym-border bg-gym-card"
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

                      <div className="flex gap-3 justify-end pt-4 border-t-2 border-gym-border">
                        <button
                          type="submit"
                          disabled={savingRoutine || selectedExerciseIds.length === 0 || !routineName.trim()}
                          className="rounded-none bg-neon-lime hover:bg-[#bce600] px-6 py-3 text-xs font-black uppercase tracking-widest text-black cursor-pointer disabled:opacity-50 transition-colors shadow-lg"
                        >
                          {savingRoutine ? "Guardando..." : "Asignar Rutina"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Rutinas Asignadas del Alumno */}
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest text-white mb-4 border-b-2 border-gym-border-light pb-2">
                      Rutinas del Alumno
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentRoutines.length === 0 ? (
                        <div className="col-span-full p-6 border-2 border-dashed border-gym-border text-center text-slate-500 text-xs font-mono uppercase">
                          El alumno no tiene rutinas activas.
                        </div>
                      ) : (
                        studentRoutines.map(routine => (
                          <div key={routine.id} className="border-2 border-gym-border bg-gym-card p-4 relative group">
                            {routine.assignedBy === userProfile.id && (
                              <div className="absolute top-0 right-0 bg-neon-lime text-black text-[9px] font-black uppercase px-2 py-0.5 shadow-sm transform translate-x-1 -translate-y-1">
                                Asignada por ti
                              </div>
                            )}
                            <h4 className="text-sm font-black uppercase text-white mb-1 pr-16">{routine.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mb-3">{routine.exerciseIds.length} ejercicios</p>
                            <div className="flex flex-wrap gap-1">
                              {routine.muscleGroupIds.map(mgId => {
                                const mg = muscleGroups.find(g => g.id === mgId);
                                return mg ? <span key={mgId} className="text-[9px] font-black uppercase bg-gym-dark border border-gym-border px-1.5 py-0.5 text-slate-300">{mg.name}</span> : null;
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest text-white mb-4 border-b-2 border-gym-border-light pb-2">
                      Evolución
                    </h3>
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
        )}
      </div>
    </div>
  );
}
