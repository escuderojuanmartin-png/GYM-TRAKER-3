import React, { useState, useEffect, useMemo } from "react";
import { 
  auth, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  googleProvider, 
  signOut
} from "./firebase";
import type { User } from "firebase/auth";
import { DataService } from "./services/dataService";
import { Workout, MuscleGroup, Exercise, Routine } from "./types";

// Subcomponents
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ActiveWorkout from "./components/ActiveWorkout";
import RoutineManager from "./components/RoutineManager";
import ExerciseManager from "./components/ExerciseManager";
import HistoryList from "./components/HistoryList";
import StatsView from "./components/StatsView";

// Icons for navigation tabs
import { 
  Home, 
  Sparkles, 
  Dumbbell, 
  Layers, 
  History, 
  TrendingUp, 
  X, 
  Calendar, 
  Clock, 
  Award,
  BookOpen
} from "lucide-react";

import LoginScreen from "./components/LoginScreen";

export default function App() {
  // Authentication & Service States
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [hasLocalData, setHasLocalData] = useState<boolean>(false);
  const [proceedOffline, setProceedOffline] = useState<boolean>(false);

  // Instantiated Database Service
  const dataService = useMemo(() => {
    return new DataService(user ? user.uid : null);
  }, [user]);

  // Core App Data States
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(4);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Active state controllers
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [selectedRoutineForWorkout, setSelectedRoutineForWorkout] = useState<Routine | undefined>(undefined);
  const [activeWorkoutMuscleGroupId, setActiveWorkoutMuscleGroupId] = useState<string | undefined>(undefined);
  const [selectedWorkoutToView, setSelectedWorkoutToView] = useState<Workout | null>(null);
  const [workoutSavedToast, setWorkoutSavedToast] = useState<boolean>(false);

  // Check for drafted session on mount
  useEffect(() => {
    const draft = localStorage.getItem("gym_tracker_active_session");
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.initialRoutine) {
          setSelectedRoutineForWorkout(parsedDraft.initialRoutine);
        }
        if (parsedDraft.activeWorkoutMuscleGroupId) {
          setActiveWorkoutMuscleGroupId(parsedDraft.activeWorkoutMuscleGroupId);
        }
        setIsWorkoutActive(true);
      } catch (e) {
        console.error("Failed to parse drafted session", e);
      }
    }
  }, []);

  // Load all user details from database service
  const loadAllUserData = async () => {
    setLoadingData(true);
    try {
      const [mGroups, exs, rts, wks, goal] = await Promise.all([
        dataService.getMuscleGroups(),
        dataService.getExercises(),
        dataService.getRoutines(),
        dataService.getWorkouts(),
        dataService.getWeeklyGoal()
      ]);

      setMuscleGroups(mGroups);
      setExercises(exs);
      setRoutines(rts);
      setWorkouts(wks);
      setWeeklyGoal(goal);
    } catch (e: any) {
      console.error("Error loading application data:", e);
      alert(`Error al cargar datos desde Firestore: ${e?.message || e}\n\nRevisa las reglas de seguridad.`);
    } finally {
      setLoadingData(false);
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
      
      // Update has local data status
      const guestService = new DataService(null);
      setHasLocalData(guestService.hasLocalDataToMigrate());
    });
    return () => unsubscribe();
  }, []);

  // Reload data whenever user changes or when explicitly requested
  useEffect(() => {
    loadAllUserData();
  }, [user, dataService]);

  // Handle Google Sign-in popup flow
  const handleLogin = async () => {
    try {
      setLoadingAuth(true);
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error("Google authentication failed:", e);
      if (e?.code === "auth/popup-closed-by-user") {
        // User closed popup, no alert needed
        return;
      }
      let errorMsg = "No se pudo iniciar sesión con Google.";
      if (e?.code === "auth/popup-blocked") {
        errorMsg += "\n\nEl navegador bloqueó la ventana emergente. Por favor, permite emergentes para esta página.";
      } else if (e?.code === "auth/unauthorized-domain") {
        errorMsg += `\n\nEl dominio '${window.location.hostname}' no está en la lista de dominios autorizados de Firebase. Asegúrate de añadirlo en Firebase Console (Authentication > Settings > Authorized domains).`;
      } else if (e?.code === "auth/operation-not-allowed") {
        errorMsg += "\n\nEl inicio de sesión con Google no está activado en la consola de Firebase (Authentication > Sign-in method > Google).";
      } else if (e?.message) {
        errorMsg += `\n\nDetalle técnico (${e.code || 'error'}): ${e.message}`;
      }
      alert(errorMsg);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Handle Email / Password Login
  const handleEmailLogin = async (email: string, pass: string) => {
    try {
      setLoadingAuth(true);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      console.error("Email login failed:", e);
      if (e?.code === "auth/user-not-found" || e?.code === "auth/invalid-credential") {
        // Try creating account automatically if login fails because account doesn't exist
        try {
          await createUserWithEmailAndPassword(auth, email, pass);
          return;
        } catch (createErr: any) {
          alert(`No se pudo crear la cuenta automáticamente: ${createErr.message}`);
          return;
        }
      } else if (e?.code === "auth/operation-not-allowed") {
        alert("El método de Correo/Contraseña no está habilitado en Firebase Console (Authentication > Sign-in method).");
      } else {
        alert(`Error de acceso (${e.code || "error"}): ${e.message}`);
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  // Handle Email / Password Signup
  const handleEmailSignUp = async (email: string, pass: string) => {
    try {
      setLoadingAuth(true);
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      console.error("Email signup failed:", e);
      if (e?.code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(auth, email, pass);
          return;
        } catch (signInErr: any) {
          alert("El correo ya está registrado con otra contraseña.");
          return;
        }
      } else if (e?.code === "auth/operation-not-allowed") {
        alert("El método de Correo/Contraseña no está habilitado en Firebase Console (Authentication > Sign-in method).");
      } else {
        alert(`Error al registrarse (${e.code || "error"}): ${e.message}`);
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  // Handle Google logout flow
  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión? Tus datos locales y en la nube se mantendrán a salvo.")) {
      try {
        await signOut(auth);
        setCurrentTab("dashboard");
        setProceedOffline(false);
      } catch (e) {
        console.error("Logout failed:", e);
      }
    }
  };

  // Handle local data to cloud migration
  const handleMigrateLocalData = async () => {
    if (!user) {
      // Prompt sign in first
      await handleLogin();
      return;
    }

    if (confirm("Hemos detectado entrenamientos y rutinas guardados en tu dispositivo local. ¿Deseas sincronizarlos y subirlos a tu cuenta de Google?")) {
      setLoadingData(true);
      const success = await dataService.migrateLocalDataToCloud();
      if (success) {
        alert("¡Éxito! Todos tus entrenamientos y rutinas locales han sido sincronizados en la nube.");
        setHasLocalData(false);
        await loadAllUserData();
      } else {
        alert("Ocurrió un error al migrar los datos. Inténtalo de nuevo más tarde.");
      }
      setLoadingData(false);
    }
  };

  // Workouts Actions
  const handleSaveWorkout = async (workoutPayload: Omit<Workout, "id" | "userId">) => {
    try {
      await dataService.addWorkout(workoutPayload);
      setIsWorkoutActive(false);
      setSelectedRoutineForWorkout(undefined);
      setActiveWorkoutMuscleGroupId(undefined);
      setCurrentTab("dashboard");
      await loadAllUserData();
      // Show success toast
      setWorkoutSavedToast(true);
      setTimeout(() => setWorkoutSavedToast(false), 4000);
    } catch (e: any) {
      console.error("Error saving completed workout:", e);
      alert(`No se pudo guardar el entrenamiento en Firestore.\n\nDetalle técnico: ${e.message || e}\n\nPor favor, verifica si creaste la base de datos Firestore en tu consola de Firebase y que las reglas de seguridad estén habilitadas.`);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await dataService.deleteWorkout(id);
      if (selectedWorkoutToView?.id === id) {
        setSelectedWorkoutToView(null);
      }
      await loadAllUserData();
    } catch (e) {
      console.error("Error deleting workout:", e);
    }
  };

  const handleUpdateWeeklyGoal = async (goal: number) => {
    try {
      await dataService.saveWeeklyGoal(goal);
      setWeeklyGoal(goal);
      await loadAllUserData();
    } catch (e) {
      console.error("Error updating weekly goal:", e);
    }
  };

  // Muscle groups & Exercises custom creation actions
  const handleAddExercise = async (name: string, muscleGroupId: string) => {
    try {
      await dataService.addExercise(name, muscleGroupId);
      await loadAllUserData();
    } catch (e) {
      console.error("Error adding exercise:", e);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este ejercicio? No se borrarán los entrenamientos pasados que lo contengan.")) {
      try {
        await dataService.deleteExercise(id);
        await loadAllUserData();
      } catch (e) {
        console.error("Error deleting exercise:", e);
      }
    }
  };

  const handleAddMuscleGroup = async (name: string) => {
    try {
      await dataService.addMuscleGroup(name);
      await loadAllUserData();
    } catch (e) {
      console.error("Error adding muscle group:", e);
    }
  };

  // Routines CRUD Actions
  const handleAddRoutine = async (name: string, exerciseIds: string[], muscleGroupIds: string[]) => {
    try {
      await dataService.addRoutine(name, exerciseIds, muscleGroupIds);
      await loadAllUserData();
    } catch (e) {
      console.error("Error adding routine:", e);
    }
  };

  const handleUpdateRoutine = async (id: string, name: string, exerciseIds: string[], muscleGroupIds: string[]) => {
    try {
      await dataService.updateRoutine(id, name, exerciseIds, muscleGroupIds);
      await loadAllUserData();
    } catch (e) {
      console.error("Error updating routine:", e);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas borrar esta rutina? No afectará a tu historial de entrenamientos.")) {
      try {
        await dataService.deleteRoutine(id);
        await loadAllUserData();
      } catch (e) {
        console.error("Error deleting routine:", e);
      }
    }
  };

  // Workout launching controllers
  const handleStartFreeWorkout = (muscleGroupId: string) => {
    // Generate a temporary single-exercise dummy or start empty
    setSelectedRoutineForWorkout(undefined);
    setActiveWorkoutMuscleGroupId(muscleGroupId);
    setIsWorkoutActive(true);
  };

  const handleStartRoutine = (routine: Routine) => {
    setSelectedRoutineForWorkout(routine);
    setActiveWorkoutMuscleGroupId(undefined);
    setIsWorkoutActive(true);
  };

  // Navigation tab schema
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "routines", label: "Rutinas", icon: Dumbbell },
    { id: "exercises", label: "Ejercicios", icon: Layers },
    { id: "history", label: "Historial", icon: History },
    { id: "stats", label: "Estadísticas", icon: TrendingUp }
  ];

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gym-dark flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin-slow rounded-none border-4 border-neon-lime border-t-transparent shadow-lg" />
      </div>
    );
  }

  if (!user && !proceedOffline) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onEmailLogin={handleEmailLogin}
        onEmailSignUp={handleEmailSignUp}
        loadingAuth={loadingAuth} 
        onContinueOffline={() => setProceedOffline(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gym-dark font-sans text-white flex flex-col antialiased">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        loadingAuth={loadingAuth}
        onLogin={handleLogin}
        onLogout={handleLogout}
        hasLocalData={hasLocalData}
        onMigrate={handleMigrateLocalData}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative">
        
        {/* Sidebar Navigation - Desktop-only */}
        {!isWorkoutActive && (
          <aside className="hidden md:flex flex-col w-56 shrink-0 space-y-2 border-r-2 border-gym-border-light pr-4">
            <div className="text-[10px] font-black tracking-widest text-neon-lime uppercase px-4 mb-2">
              MENÚ // NAVEGACIÓN
            </div>
            {navTabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-3 w-full rounded-sm px-4 py-3 text-xs font-black transition-all cursor-pointer uppercase tracking-wider ${
                    isActive 
                      ? "bg-neon-lime text-black shadow-lg shadow-neon-lime/10" 
                      : "text-slate-400 hover:bg-gym-card-light hover:text-white"
                  }`}
                >
                  <TabIcon className="h-4 w-4 stroke-[2.5]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>
        )}

        {/* Dynamic Center Page Content */}
        <main className="flex-1 min-w-0">
          
          {/* Main Load Spinner */}
          {loadingData && !isWorkoutActive ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-10 w-10 animate-spin-slow rounded-none border-4 border-neon-lime border-t-transparent shadow-lg" />
              <p className="mt-4 text-xs font-black text-neon-lime tracking-widest uppercase animate-pulse">INVOCANDO EL ESPÍRITU DEL GIMNASIO...</p>
            </div>
          ) : isWorkoutActive ? (
            /* Active logging session replaces general view entirely */
            <ActiveWorkout
              exercises={exercises}
              muscleGroups={muscleGroups}
              routines={routines}
              dataService={dataService}
              workoutsHistory={workouts}
              onSave={handleSaveWorkout}
              onCancel={() => {
                if (confirm("¿Estás seguro de que deseas cancelar este entrenamiento? Se perderán las series que has registrado.")) {
                  setIsWorkoutActive(false);
                  setSelectedRoutineForWorkout(undefined);
                  setActiveWorkoutMuscleGroupId(undefined);
                }
              }}
              initialRoutine={selectedRoutineForWorkout}
              initialMuscleGroupId={activeWorkoutMuscleGroupId}
            />
          ) : (
            /* Switch content between general tabs */
            <div className="pb-16 md:pb-0">
              {currentTab === "dashboard" && (
                <Dashboard
                  workouts={workouts}
                  muscleGroups={muscleGroups}
                  routines={routines}
                  weeklyGoal={weeklyGoal}
                  dataService={dataService}
                  onStartFreeWorkout={handleStartFreeWorkout}
                  onStartRoutine={handleStartRoutine}
                  onUpdateGoal={handleUpdateWeeklyGoal}
                  onViewWorkout={setSelectedWorkoutToView}
                />
              )}

              {currentTab === "routines" && (
                <RoutineManager
                  routines={routines}
                  exercises={exercises}
                  muscleGroups={muscleGroups}
                  onAddRoutine={handleAddRoutine}
                  onUpdateRoutine={handleUpdateRoutine}
                  onDeleteRoutine={handleDeleteRoutine}
                  onStartRoutine={handleStartRoutine}
                />
              )}

              {currentTab === "exercises" && (
                <ExerciseManager
                  exercises={exercises}
                  muscleGroups={muscleGroups}
                  onAddExercise={handleAddExercise}
                  onDeleteExercise={handleDeleteExercise}
                  onAddMuscleGroup={handleAddMuscleGroup}
                />
              )}

              {currentTab === "history" && (
                <HistoryList
                  workouts={workouts}
                  muscleGroups={muscleGroups}
                  onDeleteWorkout={handleDeleteWorkout}
                />
              )}

              {currentTab === "stats" && (
                <StatsView
                  workouts={workouts}
                  muscleGroups={muscleGroups}
                  exercises={exercises}
                  dataService={dataService}
                />
              )}
            </div>
          )}

        </main>

      </div>

      {/* Bottom Tab Bar Navigation - Mobile-only */}
      {!isWorkoutActive && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-gym-border-light bg-gym-card/90 backdrop-blur-md pb-safe md:hidden">
          <div className="flex justify-around items-center h-16 px-2">
            {navTabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-sm transition-colors cursor-pointer ${
                    isActive ? "text-neon-lime" : "text-slate-400"
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* SUCCESS TOAST - Workout saved */}
      {workoutSavedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-none border-2 border-neon-lime bg-gym-card px-5 py-3 shadow-2xl shadow-neon-lime/20 animate-in slide-in-from-top-4 duration-300">
          <div className="h-5 w-5 flex items-center justify-center text-neon-lime">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest">¡Entrenamiento guardado!</p>
            <p className="text-[10px] text-slate-400 font-mono">Sincronizado con Firebase ☁</p>
          </div>
        </div>
      )}

      {/* CALENDAR VIEW WORKOUT MODAL OVERLAY */}
      {selectedWorkoutToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-none border-2 border-gym-border-light bg-gym-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gym-border">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-none bg-gym-card-light px-2 py-0.5 text-[9px] font-black text-neon-lime uppercase tracking-widest border border-gym-border-light">
                  DETALLES DEL ENTRENAMIENTO //
                </span>
                <h3 className="text-sm font-black text-white mt-1 uppercase tracking-tight">
                  {new Date(selectedWorkoutToView.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  })}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedWorkoutToView(null)}
                className="h-8 w-8 flex items-center justify-center rounded-none text-slate-400 hover:bg-gym-card-light hover:text-white cursor-pointer border border-gym-border"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Info Stats */}
            <div className="flex items-center gap-4 text-xxs font-bold text-slate-300 bg-gym-card-light p-3 border border-gym-border mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-neon-lime" />
                <span className="font-mono">{selectedWorkoutToView.duration} MINUTOS</span>
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell className="h-3.5 w-3.5 text-neon-lime" />
                <span className="uppercase">{selectedWorkoutToView.exercises.length} EJERCICIOS</span>
              </div>
            </div>

            {/* Exercises detail list inside modal */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {selectedWorkoutToView.exercises.map((ex, exIdx) => {
                const mg = muscleGroups.find(g => g.id === ex.muscleGroupId);
                return (
                  <div key={ex.exerciseId} className="border border-gym-border-light rounded-none p-3 bg-gym-dark">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-white uppercase">#{exIdx + 1} {ex.exerciseName}</p>
                      {mg && (
                        <span className={`px-2 py-0.5 text-[8px] font-black tracking-widest uppercase border ${mg.color || "border-gym-border-light text-slate-300"}`}>
                          {mg.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ex.sets.map((set, setIdx) => (
                        <div 
                          key={set.id} 
                          className={`rounded-none border p-1.5 text-center text-xxs font-bold ${
                            set.completed 
                              ? "bg-emerald-950/20 border-emerald-800 text-emerald-400" 
                              : "bg-gym-card border-gym-border text-slate-500"
                          }`}
                        >
                          <p className="text-slate-400 font-mono">SERIE {setIdx + 1}</p>
                          <p className="font-black mt-0.5 text-xs">{set.weight} KG × {set.reps}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons inside modal footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gym-border mt-5">
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de que deseas borrar este entrenamiento del historial?")) {
                    handleDeleteWorkout(selectedWorkoutToView.id);
                  }
                }}
                className="rounded-none border border-red-900 bg-red-950/20 hover:bg-red-900/30 text-red-400 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer mr-auto"
              >
                Eliminar
              </button>
              <button
                onClick={() => setSelectedWorkoutToView(null)}
                className="rounded-none bg-white hover:bg-neutral-200 text-black px-5 py-2 text-xs font-black uppercase tracking-widest cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
