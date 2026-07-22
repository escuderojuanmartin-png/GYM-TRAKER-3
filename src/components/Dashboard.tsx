import React, { useState, useMemo } from "react";
import { 
  Play, 
  Settings, 
  Flame, 
  Calendar, 
  Plus, 
  CheckCircle, 
  ChevronRight, 
  Dumbbell, 
  HelpCircle,
  TrendingUp,
  Sliders,
  ChevronDown
} from "lucide-react";
import { Workout, MuscleGroup, Routine } from "../types";
import { DataService } from "../services/dataService";
import ActivityCalendar from "./ActivityCalendar";

interface DashboardProps {
  workouts: Workout[];
  muscleGroups: MuscleGroup[];
  routines: Routine[];
  weeklyGoal: number;
  dataService: DataService;
  onStartFreeWorkout: (muscleGroupId: string) => void;
  onStartRoutine: (routine: Routine) => void;
  onUpdateGoal: (goal: number) => void;
  onViewWorkout: (workout: Workout) => void;
}

export default function Dashboard({
  workouts,
  muscleGroups,
  routines,
  weeklyGoal,
  dataService,
  onStartFreeWorkout,
  onStartRoutine,
  onUpdateGoal,
  onViewWorkout
}: DashboardProps) {
  const [selectedGroupOverrideId, setSelectedGroupOverrideId] = useState<string | null>(null);
  const [showOverrideList, setShowOverrideList] = useState<boolean>(false);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [editingGoalVal, setEditingGoalVal] = useState<number>(weeklyGoal);

  // Compute recommended muscle groups ranking
  const recommendations = useMemo(() => {
    return dataService.getMuscleGroupRecommendations(workouts, muscleGroups);
  }, [workouts, muscleGroups, dataService]);

  // Determine active recommended muscle group
  const activeRecommendation = useMemo(() => {
    if (recommendations.length === 0) return null;
    if (selectedGroupOverrideId) {
      const foundOverride = recommendations.find(r => r.group.id === selectedGroupOverrideId);
      if (foundOverride) return foundOverride;
    }
    return recommendations[0];
  }, [recommendations, selectedGroupOverrideId]);

  // Compute rolling weekly stats (last 7 days)
  const weeklyStats = useMemo(() => {
    return dataService.getWeeklyRollingStats(workouts, weeklyGoal);
  }, [workouts, weeklyGoal, dataService]);

  const handleSelectOverride = (mgId: string) => {
    setSelectedGroupOverrideId(mgId);
    setShowOverrideList(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoalVal > 0 && editingGoalVal <= 14) {
      onUpdateGoal(editingGoalVal);
      setIsEditingGoal(false);
    }
  };

  // Get last workout
  const lastWorkout = useMemo(() => {
    const completedWorkouts = [...workouts].filter(w => w.status === 'COMPLETED').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (completedWorkouts.length === 0) return null;
    return completedWorkouts[0];
  }, [workouts]);

  const getLastWorkoutText = (workout: Workout) => {
    if (!workout) return null;
    const mg = workout.primaryMuscleGroupId ? muscleGroups.find(m => m.id === workout.primaryMuscleGroupId) : null;
    const mgName = mg ? mg.name : "Sesión";
    
    // Calculate if it was yesterday or today etc.
    const wDate = new Date(workout.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    const wDateZero = new Date(wDate);
    wDateZero.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today.getTime() - wDateZero.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let timeText = "";
    if (diffDays === 0) timeText = "Hoy";
    else if (diffDays === 1) timeText = "Ayer";
    else timeText = `Hace ${diffDays} días`;

    return `${mgName} · ${workout.duration} min · ${timeText}`;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-black tracking-tighter text-white">
          Buenos días
        </h2>
      </div>

      {/* Recommendation Widget */}
      <div className="rounded-none border border-gym-border-light bg-gym-card p-5">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Próximo entrenamiento recomendado</p>
        
        {activeRecommendation ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                {activeRecommendation.group.name}
              </h3>
              <p className="text-sm text-slate-300 mt-1 font-mono uppercase">
                {activeRecommendation.daysSinceLast === null 
                  ? "Nuevo" 
                  : `Hace ${activeRecommendation.daysSinceLast} días`
                }
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onStartFreeWorkout(activeRecommendation.group.id)}
                className="w-full rounded-none bg-white hover:bg-neutral-200 active:scale-[0.99] text-black px-6 py-3 text-sm font-black tracking-widest uppercase transition-all cursor-pointer border border-transparent"
              >
                Comenzar entrenamiento
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowOverrideList(!showOverrideList)}
                  className="w-full flex justify-center items-center gap-2 rounded-none border border-gym-border-light bg-gym-dark hover:bg-gym-card-light px-6 py-3 text-sm font-black text-white transition-all cursor-pointer uppercase tracking-widest"
                >
                  Cambiar grupo
                </button>
                {showOverrideList && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-none border border-gym-border-light bg-gym-card p-2 shadow-2xl">
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {recommendations.map(r => (
                        <button
                          key={r.group.id}
                          onClick={() => handleSelectOverride(r.group.id)}
                          className={`flex w-full items-center justify-between rounded-none px-3 py-2 text-left text-sm font-bold uppercase hover:bg-gym-card-light cursor-pointer ${
                            activeRecommendation.group.id === r.group.id ? "bg-gym-card-light text-white" : "text-slate-400"
                          }`}
                        >
                          <span>{r.group.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-slate-500 text-xs font-mono uppercase">
            Inicializa grupos musculares en Configuración.
          </div>
        )}
      </div>

      {/* Rolling Weekly Goal Tracker */}
      <div className="rounded-none border border-gym-border-light bg-gym-card p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Actividad últimos 7 días</p>
          <button
            onClick={() => {
              setEditingGoalVal(weeklyGoal);
              setIsEditingGoal(!isEditingGoal);
            }}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {isEditingGoal ? (
          <form onSubmit={handleSaveGoal} className="mt-2 space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase">Sesiones objetivo</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="14"
                value={editingGoalVal}
                onChange={(e) => setEditingGoalVal(parseInt(e.target.value, 10) || 1)}
                className="w-16 rounded-none border border-gym-border bg-gym-dark p-2 text-center text-sm font-black text-white focus:border-white focus:outline-none"
                required
              />
              <button
                type="submit"
                className="rounded-none bg-white px-4 py-2 text-xs font-black text-black uppercase tracking-wider"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-bold text-white uppercase font-mono">
              {weeklyStats.count} de {weeklyGoal} sesiones completadas
            </p>
            <div className="h-4 w-full bg-gym-dark border border-gym-border-light rounded-none overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${weeklyStats.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Calendario */}
      <div className="rounded-none border border-gym-border-light bg-gym-card p-5">
        <ActivityCalendar
          workouts={workouts}
          muscleGroups={muscleGroups}
          onViewWorkout={onViewWorkout}
        />
      </div>

      {/* Último entrenamiento */}
      {lastWorkout && (
        <div className="rounded-none border border-gym-border-light bg-gym-card p-5">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Último entrenamiento</p>
          <p className="text-sm font-bold text-white uppercase font-mono tracking-wide">
            {getLastWorkoutText(lastWorkout)}
          </p>
        </div>
      )}

    </div>
  );
}
