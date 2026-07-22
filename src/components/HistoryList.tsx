import React, { useState, useMemo } from "react";
import { Search, Calendar, Clock, Trash2, ChevronDown, ChevronUp, FileText, Dumbbell, Sparkles } from "lucide-react";
import { Workout, MuscleGroup } from "../types";

interface HistoryListProps {
  workouts: Workout[];
  muscleGroups: MuscleGroup[];
  onDeleteWorkout: (id: string) => void;
}

export default function HistoryList({
  workouts,
  muscleGroups,
  onDeleteWorkout
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Toggle workout accordion expand/collapse
  const toggleExpand = (id: string) => {
    setExpandedWorkoutId(prev => (prev === id ? null : id));
  };

  // Format date in a human-friendly Spanish format
  const formatDateSpanish = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter workouts by search query (checks exercise names, muscle groups, notes)
  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter(w => {
        const notesMatch = w.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        const exercisesMatch = w.exercises.some(ex => 
          ex.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const muscleMatch = w.muscleGroupIds.some(mgId => {
          const mg = muscleGroups.find(g => g.id === mgId);
          return mg?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        return notesMatch || exercisesMatch || muscleMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts, searchQuery, muscleGroups]);

  // Group workouts by month string (e.g. "MARZO 2024")
  const groupedWorkouts = useMemo<{ [monthStr: string]: Workout[] }>(() => {
    const groups: { [monthStr: string]: Workout[] } = {};
    filteredWorkouts.forEach(workout => {
      const d = new Date(workout.date);
      const monthStr = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase();
      if (!groups[monthStr]) groups[monthStr] = [];
      groups[monthStr].push(workout);
    });
    return groups;
  }, [filteredWorkouts]);

  return (
    <div className="space-y-4 text-white pb-24">
      
      {/* Search Input Filter */}
      <div className="relative rounded-none border-2 border-gym-border-light bg-gym-card p-4 shadow-xl">
        <div className="relative">
          <Search className="absolute top-3 left-4 h-4.5 w-4.5 text-neon-lime" />
          <input
            type="text"
            placeholder="Buscar por ejercicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-none border border-gym-border bg-gym-dark py-2.5 pl-11 pr-4 text-xs font-black text-white placeholder-slate-500 focus:border-neon-lime focus:bg-gym-card-light focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* History Feed list */}
      <div className="space-y-6">
        {filteredWorkouts.length === 0 ? (
          <div className="rounded-none border-2 border-dashed border-gym-border-light bg-gym-card/40 p-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-gym-card border border-gym-border text-slate-500">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-black text-white uppercase tracking-wider">No hay entrenamientos</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto uppercase font-mono tracking-wide">
              {searchQuery ? "No se encontraron coincidencias para tu búsqueda." : "Registra tu primer entrenamiento desde el Dashboard para ver tu historial aquí."}
            </p>
          </div>
        ) : (
          (Object.entries(groupedWorkouts) as [string, Workout[]][]).map(([monthStr, monthWorkouts]) => (
            <div key={monthStr} className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-gym-border pb-1">
                {monthStr}
              </h3>
              <div className="space-y-3">
                {monthWorkouts.map(workout => {
                  const isExpanded = expandedWorkoutId === workout.id;
                  const workoutDate = formatDateSpanish(workout.date);
                  
                  const primaryMuscleGroup = workout.primaryMuscleGroupId 
                    ? muscleGroups.find(g => g.id === workout.primaryMuscleGroupId) 
                    : muscleGroups.find(g => g.id === workout.muscleGroupIds[0]);

                  const workoutTitle = primaryMuscleGroup ? primaryMuscleGroup.name : "Sesión de Fuerza";

                  return (
                    <div 
                      key={workout.id}
                      className="rounded-none border border-gym-border bg-gym-card overflow-hidden shadow-xl hover:border-neon-lime transition-all duration-150"
                    >
                      {/* Header Card Area */}
                      <div 
                        onClick={() => toggleExpand(workout.id)}
                        className="flex flex-col gap-1.5 p-4 cursor-pointer hover:bg-gym-card-light select-none"
                      >
                        <p className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider">{workoutDate}</p>
                        <h4 className="text-lg font-black text-white uppercase tracking-wide">
                          {workoutTitle}
                        </h4>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest font-mono">
                          <span>{workout.exercises.length} ejercicios</span> · <span>{workout.duration} min</span>
                        </div>
                      </div>

                      {/* Expanded Accordion Body Detail */}
                      {isExpanded && (
                        <div className="border-t border-gym-border bg-gym-dark/30 p-4 space-y-4">
                    {/* Notes if present */}
                    {workout.notes && (
                      <div className="flex items-start gap-2 rounded-none bg-gym-card-light border border-gym-border p-3 text-xxs font-black uppercase tracking-wider text-slate-300 font-mono">
                        <FileText className="h-4 w-4 text-neon-lime shrink-0 mt-0.5" />
                        <div>
                          <p className="font-black text-white">Notas de sesión:</p>
                          <p className="mt-0.5 text-slate-400 italic">"{workout.notes}"</p>
                        </div>
                      </div>
                    )}

                    {/* Exercises Details list */}
                    <div className="space-y-3.5">
                      {workout.exercises.map((ex, exIdx) => {
                        const mg = muscleGroups.find(g => g.id === ex.muscleGroupId);
                        return (
                          <div key={ex.exerciseId} className="bg-gym-card border-2 border-gym-border rounded-none p-3.5 shadow-md">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gym-border/30">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-neon-lime font-mono">#{exIdx + 1}</span>
                                <h5 className="text-xs font-black text-white uppercase tracking-wide">{ex.exerciseName}</h5>
                              </div>
                              {mg && (
                                <span className={`rounded-none px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-gym-border bg-gym-dark text-slate-300`}>
                                  {mg.name}
                                </span>
                              )}
                            </div>

                            {/* Sets list */}
                            <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
                              {ex.sets.map((set, setIdx) => (
                                <div 
                                  key={set.id} 
                                  className={`rounded-none border p-2 text-center text-xxs font-black uppercase tracking-widest font-mono transition-all ${
                                    set.completed 
                                      ? "bg-emerald-950/20 border-emerald-800 text-emerald-400" 
                                      : "bg-gym-dark/20 border-gym-border text-slate-600 line-through"
                                  }`}
                                >
                                  <p className="text-slate-500 font-black">SERIE {setIdx + 1}</p>
                                  <p className="text-xs font-black mt-0.5 text-white">{set.weight} KG × {set.reps}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delete Workout Action */}
                    <div className="flex justify-end pt-3 border-t-2 border-gym-border">
                      <button
                        onClick={() => {
                          if (confirm("¿Estás seguro de que deseas eliminar este entrenamiento del historial? Esta acción es irreversible.")) {
                            onDeleteWorkout(workout.id);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-none border border-red-900 bg-red-950/20 hover:bg-red-900/30 text-red-400 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Eliminar del Historial</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
}
