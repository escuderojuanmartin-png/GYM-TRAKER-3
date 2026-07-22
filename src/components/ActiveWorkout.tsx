import React, { useState, useEffect, useMemo } from "react";
import { 
  Play, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Search, 
  PlusCircle, 
  ChevronDown, 
  CheckCircle,
  Dumbbell,
  Clock,
  BookOpen,
  History,
  Award
} from "lucide-react";
import { Workout, MuscleGroup, Exercise, WorkoutExercise, WorkoutSet, Routine } from "../types";
import { DataService } from "../services/dataService";

interface ActiveWorkoutProps {
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  routines: Routine[];
  dataService: DataService;
  workoutsHistory: Workout[];
  onSave: (workout: Omit<Workout, "id" | "userId">) => void;
  onCancel: () => void;
  initialRoutine?: Routine;
  initialMuscleGroupId?: string;
}

export default function ActiveWorkout({
  exercises,
  muscleGroups,
  routines,
  dataService,
  workoutsHistory,
  onSave,
  onCancel,
  initialRoutine,
  initialMuscleGroupId
}: ActiveWorkoutProps) {
  // Timer state
  const [seconds, setSeconds] = useState<number>(0);
  const [startTimeRaw, setStartTimeRaw] = useState<number>(Date.now());
  const [notes, setNotes] = useState<string>("");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [isResumed, setIsResumed] = useState(false);
  
  // Modals / Dropdowns
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>("all");

  // Format stopwatch time
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [seconds]);

  // Handle draft loading
  useEffect(() => {
    const draftData = localStorage.getItem("gym_tracker_active_session");
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        setSeconds(draft.seconds || 0);
        if (draft.startTimeRaw) setStartTimeRaw(draft.startTimeRaw);
        setNotes(draft.notes || "");
        setSelectedExercises(draft.selectedExercises || []);
        setIsResumed(true);
        return; // Skip the normal initialization if resumed
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }

    // Load exercises from initial routine if provided and not resuming
    if (initialRoutine) {
      const initialList: WorkoutExercise[] = [];
      initialRoutine.exerciseIds.forEach(exId => {
        const ex = exercises.find(e => e.id === exId);
        if (ex) {
          // Fetch stats to pre-populate weights/reps
          const stats = dataService.getExerciseHistory(workoutsHistory, ex.id);
          const defaultWeight = stats.lastWeight > 0 ? stats.lastWeight : 10;
          
          const newWeId = "we_" + Date.now() + "_" + Math.random().toString(36).substring(7);
          initialList.push({
            id: newWeId,
            workoutId: "draft",
            order: initialList.length,
            completed: false,
            exerciseId: ex.id,
            exerciseName: ex.name,
            muscleGroupId: ex.muscleGroupId,
            sets: [
              { id: "set_" + Date.now() + "_" + Math.random().toString(36).substring(7), workoutExerciseId: newWeId, setNumber: 1, weight: defaultWeight, reps: 10, completed: false }
            ]
          });
        }
      });
      setSelectedExercises(initialList);
    } else {
      // Start empty
      setSelectedExercises([]);
    }
  }, [initialRoutine, exercises, workoutsHistory, dataService]);

  // Save draft periodically or when state changes
  useEffect(() => {
    // Only save draft if there is something substantial or we've started tracking
    if (selectedExercises.length > 0 || seconds > 0) {
      const draft = {
        seconds,
        startTimeRaw,
        notes,
        selectedExercises,
        initialRoutine,
        activeWorkoutMuscleGroupId: initialMuscleGroupId
      };
      localStorage.setItem("gym_tracker_active_session", JSON.stringify(draft));
    }
  }, [seconds, startTimeRaw, notes, selectedExercises, initialRoutine, initialMuscleGroupId]);

  const clearDraft = () => {
    localStorage.removeItem("gym_tracker_active_session");
  };

  // Get historical stats for an exercise
  const getExerciseStats = (exerciseId: string) => {
    return dataService.getExerciseHistory(workoutsHistory, exerciseId);
  };

  // Add a set to an exercise
  const handleAddSet = (exerciseId: string) => {
    setSelectedExercises(prev => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;

      const lastSet = ex.sets[ex.sets.length - 1];
      const weight = lastSet ? lastSet.weight : 10;
      const reps = lastSet ? lastSet.reps : 10;

      const newSet: WorkoutSet = {
        id: `set_${Date.now()}_${Math.random().toString(36).substring(7)}`, workoutExerciseId: ex.id, setNumber: ex.sets.length + 1,
        weight,
        reps,
        completed: false
      };

      return {
        ...ex,
        sets: [...ex.sets, newSet]
      };
    }));
  };

  // Update set details
  const handleUpdateSet = (exerciseId: string, setId: string, field: "weight" | "reps", value: number) => {
    setSelectedExercises(prev => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  // Toggle set completion
  const handleToggleSetCompleted = (exerciseId: string, setId: string) => {
    setSelectedExercises(prev => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
      };
    }));
  };

  // Remove set from an exercise
  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setSelectedExercises(prev => prev.map(ex => {
      if (ex.exerciseId !== exerciseId) return ex;
      // Keep at least 1 set
      if (ex.sets.length <= 1) return ex;
      return {
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      };
    }));
  };

  // Remove whole exercise from session
  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.exerciseId !== exerciseId));
  };

  // Add exercise to active session
  const handleAddExerciseToWorkout = (ex: Exercise) => {
    // Check if already added
    if (selectedExercises.some(item => item.exerciseId === ex.id)) {
      setShowAddExerciseModal(false);
      return;
    }

    const stats = getExerciseStats(ex.id);
    const defaultWeight = stats.lastWeight > 0 ? stats.lastWeight : 10;

    const newWorkoutExId = "we_" + Date.now();
    const newWorkoutEx: WorkoutExercise = {
      id: newWorkoutExId,
      workoutId: "draft",
      order: selectedExercises.length,
      completed: false,
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroupId: ex.muscleGroupId,
      sets: [
        { id: `set_${Date.now()}_0`, workoutExerciseId: newWorkoutExId, setNumber: 1, weight: defaultWeight, reps: 10, completed: false }
      ]
    };

    setSelectedExercises(prev => [...prev, newWorkoutEx]);
    setShowAddExerciseModal(false);
    setSearchQuery("");
  };

  // Filter exercises for modal
  const filteredExercisesForModal = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscleFilter === "all" || ex.muscleGroupId === selectedMuscleFilter;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchQuery, selectedMuscleFilter]);

  // Handle saving the full workout
  const handleSaveWorkout = () => {
    // Validate that there is at least one completed set
    const hasCompletedSet = selectedExercises.some(ex => ex.sets.some(s => s.completed));
    if (!hasCompletedSet) {
      alert("Por favor completa al menos una serie (marcando la casilla ✓) antes de guardar el entrenamiento.");
      return;
    }

    // Prepare workout payload
    const muscleGroupIdsSet = new Set<string>();
    const cleanedExercises = selectedExercises.map(ex => {
      muscleGroupIdsSet.add(ex.muscleGroupId);
      // Only store sets that have values, we can save all or only completed. Let's save all but keep completion state!
      return ex;
    }).filter(ex => ex.sets.length > 0);

    const durationMin = Math.max(1, Math.round(seconds / 60));

    clearDraft();

    onSave({
      date: new Date().toISOString(),
      duration: durationMin,
      notes,
      exercises: cleanedExercises,
      muscleGroupIds: Array.from(muscleGroupIdsSet),
      status: 'COMPLETED',
      primaryMuscleGroupId: (initialRoutine && initialRoutine.muscleGroupIds && initialRoutine.muscleGroupIds.length > 0) ? initialRoutine.muscleGroupIds[0] : (Array.from(muscleGroupIdsSet)[0] || null),
      startTime: new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: new Date().toISOString()
    });
  };

  const headerTitle = initialRoutine 
    ? initialRoutine.name 
    : (initialMuscleGroupId 
      ? muscleGroups.find(g => g.id === initialMuscleGroupId)?.name || "Entrenamiento Libre"
      : "Entrenamiento Libre");

  const startTimeFormatted = useMemo(() => {
    return new Date(startTimeRaw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [startTimeRaw]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-24 text-white">
      
      {/* Active Session Header */}
      <div className="flex flex-col px-1 pt-2 pb-4">
        <button 
          onClick={() => { clearDraft(); onCancel(); }}
          className="flex items-center gap-2 text-neon-lime font-black uppercase tracking-wider text-lg w-fit cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">←</span> {headerTitle}
        </button>
        <div className="mt-2 text-sm text-slate-400 font-medium">
          <span className="text-neon-lime font-bold">En curso</span> · Inicio {startTimeFormatted}
        </div>
        <div className="mt-1 text-sm text-slate-400 font-medium">
          {selectedExercises.length} ejercicios
        </div>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Añadir notas..."
          className="mt-4 w-full rounded-none border border-transparent border-b-gym-border-light bg-transparent p-2 text-sm text-white placeholder-slate-600 focus:border-b-neon-lime focus:outline-none resize-none overflow-hidden min-h-[40px]"
          rows={1}
        />
      </div>

      {/* Exercises Log List */}
      <div className="space-y-4">
        {selectedExercises.length === 0 ? (
          <div className="rounded-none border-2 border-dashed border-gym-border-light bg-gym-card/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-gym-card-light border border-gym-border text-neon-lime">
              <Dumbbell className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="mt-4 text-sm font-black text-white uppercase tracking-wider">Tu entrenamiento está vacío</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto uppercase tracking-wide font-mono">Añade ejercicios a tu sesión para empezar a registrar tus series y progresión de cargas.</p>
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-none bg-white px-4 py-2 text-xs font-black text-black hover:bg-neutral-200 shadow-sm cursor-pointer uppercase tracking-widest"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Añadir Ejercicio</span>
            </button>
          </div>
        ) : (
          selectedExercises.map((exEntry, exIdx) => {
            const mg = muscleGroups.find(g => g.id === exEntry.muscleGroupId);
            const stats = getExerciseStats(exEntry.exerciseId);

            return (
              <div 
                key={exEntry.exerciseId} 
                className="rounded-none border-2 border-gym-border-light bg-gym-card overflow-hidden shadow-xl"
              >
                {/* Exercise Title Area */}
                <div className="flex items-center justify-between bg-gym-card-light px-5 py-3.5 border-b border-gym-border">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-neon-lime font-mono">#{exIdx + 1}</span>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wide">{exEntry.exerciseName}</h4>
                      {mg && (
                        <span className={`inline-block mt-0.5 rounded-none px-2 py-0.5 text-[9px] font-black tracking-widest uppercase border ${mg.color || "border-gym-border text-slate-300 bg-gym-dark"}`}>
                          {mg.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Exercise Trigger */}
                  <button
                    onClick={() => handleRemoveExercise(exEntry.exerciseId)}
                    className="flex h-8 w-8 items-center justify-center rounded-none text-slate-400 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-colors cursor-pointer"
                    title="Eliminar ejercicio de la sesión"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Weights info & history indicators */}
                <div className="grid grid-cols-2 gap-4 px-5 py-2.5 bg-gym-dark border-b border-gym-border text-xxs font-black text-slate-400 uppercase tracking-wider font-mono">
                  <div className="flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-neon-lime" />
                    <span>Último peso: <strong className="text-white font-black">{stats.lastWeight > 0 ? `${stats.lastWeight} kg` : "N/A"}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-neon-lime" />
                    <span>Récord Histórico: <strong className="text-white font-black">{stats.maxWeight > 0 ? `${stats.maxWeight} kg` : "N/A"}</strong></span>
                  </div>
                </div>

                {/* Sets Header */}
                <div className="px-5 pt-4 pb-1">
                  <div className="grid grid-cols-12 gap-3 text-center text-[10px] font-black uppercase tracking-widest text-neon-lime">
                    <div className="col-span-2 text-left">SERIE</div>
                    <div className="col-span-4">CARGA (KG)</div>
                    <div className="col-span-4">REPETICIONES</div>
                    <div className="col-span-2">LOGRADA</div>
                  </div>
                </div>

                {/* Sets List */}
                <div className="px-5 pb-4 space-y-2">
                  {exEntry.sets.map((set, setIdx) => (
                    <div 
                      key={set.id} 
                      className={`grid grid-cols-12 gap-3 items-center text-center py-1.5 px-2 rounded-none transition-all ${
                        set.completed ? "bg-emerald-950/20 border border-emerald-800" : "border border-transparent"
                      }`}
                    >
                      {/* Set index */}
                      <div className="col-span-2 text-left flex items-center gap-1">
                        <button
                          onClick={() => handleRemoveSet(exEntry.exerciseId, set.id)}
                          className="text-slate-500 hover:text-red-400 hover:bg-red-950/20 p-1 rounded-none transition-colors"
                          title="Eliminar serie"
                          disabled={exEntry.sets.length <= 1}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-black text-white font-mono">{setIdx + 1}</span>
                      </div>

                      {/* Weight input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.weight || ""}
                          onChange={(e) => handleUpdateSet(exEntry.exerciseId, set.id, "weight", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          disabled={set.completed}
                          className="w-full text-center rounded-none border border-gym-border-light bg-gym-dark py-1 text-xs font-black text-white focus:border-neon-lime focus:bg-gym-card-light focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      {/* Reps input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={set.reps || ""}
                          onChange={(e) => handleUpdateSet(exEntry.exerciseId, set.id, "reps", parseInt(e.target.value, 10) || 0)}
                          placeholder="0"
                          disabled={set.completed}
                          className="w-full text-center rounded-none border border-gym-border-light bg-gym-dark py-1 text-xs font-black text-white focus:border-neon-lime focus:bg-gym-card-light focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      {/* Tick off checkbox */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => handleToggleSetCompleted(exEntry.exerciseId, set.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-none border transition-all cursor-pointer ${
                            set.completed 
                              ? "bg-neon-lime border-neon-lime text-black shadow-lg" 
                              : "border-gym-border-light hover:border-neon-lime bg-gym-dark text-transparent"
                          }`}
                        >
                          <CheckCircle className={`h-4 w-4 ${set.completed ? "text-black" : "text-transparent"}`} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add set trigger */}
                  <button
                    onClick={() => handleAddSet(exEntry.exerciseId)}
                    className="mt-2 flex items-center justify-center gap-1 w-full rounded-none border border-dashed border-gym-border-light hover:border-neon-lime hover:bg-gym-card-light py-2 text-xs font-black text-slate-400 hover:text-white transition-colors cursor-pointer uppercase tracking-widest"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Añadir Serie</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Button Rail to Add Exercise or Save Session */}
      <div className="flex flex-col gap-3 pt-4 pb-8">
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-none border border-dashed border-gym-border-light hover:border-neon-lime bg-transparent hover:bg-gym-card-light text-slate-400 hover:text-white py-4 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Añadir Ejercicio</span>
        </button>
        
        <button
          onClick={handleSaveWorkout}
          className="w-full mt-4 flex items-center justify-center gap-2 rounded-none bg-neon-lime hover:bg-neon-lime/90 text-black py-4 text-sm font-black uppercase tracking-widest active:scale-[0.99] transition-all cursor-pointer"
        >
          FINALIZAR ENTRENAMIENTO
        </button>
      </div>

      {/* SEARCH / ADD EXERCISE MODAL */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-none border-2 border-gym-border-light bg-gym-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between mb-4 border-b border-gym-border pb-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">AÑADIR EJERCICIO //</h3>
              <button 
                onClick={() => setShowAddExerciseModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-none text-slate-400 hover:bg-gym-card-light hover:text-white border border-gym-border cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search + Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-none border border-gym-border bg-gym-dark py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-neon-lime focus:bg-gym-card-light focus:outline-none"
                />
              </div>

              {/* Muscle Group Filter Badges */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-gym-border">
                <button
                  onClick={() => setSelectedMuscleFilter("all")}
                  className={`rounded-none px-2.5 py-1 text-xxs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    selectedMuscleFilter === "all"
                      ? "bg-neon-lime text-black border-neon-lime"
                      : "bg-gym-dark text-slate-400 border-gym-border-light hover:bg-gym-card-light"
                  }`}
                >
                  Todos
                </button>
                {muscleGroups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedMuscleFilter(g.id)}
                    className={`rounded-none px-2.5 py-1 text-xxs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedMuscleFilter === g.id
                        ? "bg-white text-black border-white"
                        : "bg-gym-dark text-slate-400 border-gym-border-light hover:bg-gym-card-light"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Results List */}
            <div className="mt-3 max-h-60 overflow-y-auto space-y-1 pr-1">
              {filteredExercisesForModal.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-500 font-mono uppercase tracking-wider">No se encontraron ejercicios</p>
              ) : (
                filteredExercisesForModal.map(ex => {
                  const isAlreadyAdded = selectedExercises.some(item => item.exerciseId === ex.id);
                  const mg = muscleGroups.find(g => g.id === ex.muscleGroupId);
                  
                  return (
                    <button
                      key={ex.id}
                      onClick={() => !isAlreadyAdded && handleAddExerciseToWorkout(ex)}
                      disabled={isAlreadyAdded}
                      className={`flex w-full items-center justify-between rounded-none px-3 py-2 text-left text-xs font-bold uppercase transition-all border ${
                        isAlreadyAdded 
                          ? "bg-gym-card-light text-slate-500 border-gym-border opacity-60 cursor-not-allowed" 
                          : "bg-gym-dark hover:bg-gym-card-light hover:border-neon-lime text-white border-gym-border-light cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Dumbbell className={`h-4 w-4 ${isAlreadyAdded ? "text-slate-600" : "text-neon-lime"}`} />
                        <div>
                          <p className="text-xs font-black">{ex.name}</p>
                          {mg && <p className="text-[9px] font-black text-slate-500 mt-0.5 tracking-wider">{mg.name}</p>}
                        </div>
                      </div>
                      
                      {isAlreadyAdded ? (
                        <span className="text-[10px] font-black text-neon-lime bg-neon-lime/10 px-2 py-0.5 rounded-none border border-neon-lime/30 tracking-widest uppercase">Añadido</span>
                      ) : (
                        <Plus className="h-4 w-4 text-slate-400 group-hover:text-neon-lime" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
