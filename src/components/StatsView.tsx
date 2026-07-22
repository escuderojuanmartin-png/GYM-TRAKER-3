import React, { useState, useMemo } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from "recharts";
import { TrendingUp, Dumbbell, Calendar, PieChart as PieIcon, BarChart2 } from "lucide-react";
import { Workout, MuscleGroup, Exercise } from "../types";
import { DataService } from "../services/dataService";

interface StatsViewProps {
  workouts: Workout[];
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
  dataService: DataService;
}

export default function StatsView({
  workouts,
  muscleGroups,
  exercises,
  dataService
}: StatsViewProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  // Default select first exercise that has some logged history if possible
  useMemo(() => {
    if (!selectedExerciseId && exercises.length > 0) {
      // Find an exercise that actually has history
      const withHistory = exercises.find(ex => 
        workouts.some(w => w.exercises.some(we => we.exerciseId === ex.id))
      );
      setSelectedExerciseId(withHistory?.id || exercises[0].id);
    }
  }, [exercises, workouts, selectedExerciseId]);

  // Compute stats for selected exercise
  const exerciseStats = useMemo(() => {
    if (!selectedExerciseId) return null;
    return dataService.getExerciseHistory(workouts, selectedExerciseId);
  }, [workouts, selectedExerciseId, dataService]);

  // Exercise selection dropdown items (only exercises with at least one logged completion)
  const exercisesWithHistory = useMemo(() => {
    return exercises.map(ex => {
      const history = dataService.getExerciseHistory(workouts, ex.id);
      return {
        ...ex,
        hasHistory: history.history.length > 0,
        lastWeight: history.lastWeight,
        maxWeight: history.maxWeight
      };
    }).sort((a, b) => (b.hasHistory ? 1 : 0) - (a.hasHistory ? 1 : 0));
  }, [exercises, workouts, dataService]);

  // Muscle group training frequency count
  const muscleGroupDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    muscleGroups.forEach(g => {
      counts[g.id] = 0;
    });

    workouts.forEach(workout => {
      workout.muscleGroupIds.forEach(mgId => {
        if (counts[mgId] !== undefined) {
          counts[mgId]++;
        } else {
          counts[mgId] = 1;
        }
      });
    });

    return muscleGroups.map(g => ({
      name: g.name,
      value: counts[g.id] || 0,
      color: g.color.includes("red") ? "#FF3366" :
             g.color.includes("blue") ? "#33CCFF" :
             g.color.includes("emerald") ? "#CCFF00" :
             g.color.includes("orange") ? "#FF9933" :
             g.color.includes("purple") ? "#BB66FF" :
             g.color.includes("amber") ? "#FFD700" : "#888888"
    })).filter(item => item.value > 0);
  }, [workouts, muscleGroups]);

  // Activity over last 6 months (workouts per month)
  const monthlyActivityData = useMemo(() => {
    const monthsData: Record<string, number> = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthsData[key] = 0;
    }

    workouts.forEach(w => {
      const dateKey = w.date.substring(0, 7); // "YYYY-MM"
      if (monthsData[dateKey] !== undefined) {
        monthsData[dateKey]++;
      }
    });

    const monthNamesShort = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    return Object.entries(monthsData).map(([key, val]) => {
      const [year, mStr] = key.split("-");
      const mIdx = parseInt(mStr, 10) - 1;
      return {
        month: `${monthNamesShort[mIdx]} ${year.substring(2)}`,
        entrenamientos: val
      };
    });
  }, [workouts]);

  // General KPIs
  const totalWorkouts = workouts.length;
  const totalDurationMin = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDurationMin / totalWorkouts) : 0;

  const currentExercise = exercises.find(e => e.id === selectedExerciseId);

  return (
    <div className="space-y-6 text-white">
      
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-5 shadow-xl">
          <p className="text-xxs font-black uppercase tracking-widest text-slate-400">Total Sesiones //</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-neon-lime">{totalWorkouts}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">sesiones</span>
          </div>
        </div>
        <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-5 shadow-xl">
          <p className="text-xxs font-black uppercase tracking-widest text-slate-400">Tiempo Total //</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalDurationMin}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">minutos</span>
          </div>
        </div>
        <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-5 shadow-xl">
          <p className="text-xxs font-black uppercase tracking-widest text-slate-400">Promedio Sesión //</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgDuration}</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">min / ent</span>
          </div>
        </div>
        <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-5 shadow-xl">
          <p className="text-xxs font-black uppercase tracking-widest text-slate-400">Mejor Récord //</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-neon-lime">
              {exerciseStats?.maxWeight || 0}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">kg (ejercicio)</span>
          </div>
        </div>
      </div>

      {/* Primary Chart: Progression over Time */}
      <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-6 shadow-xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neon-lime" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">PROGRESIÓN DE CARGAS //</h3>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-1">Carga máxima levantada por sesión de entrenamiento</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xxs font-black uppercase tracking-widest text-slate-400">EJERCICIO:</span>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="rounded-none border border-gym-border bg-gym-dark px-3 py-1.5 text-xs font-black text-white focus:border-neon-lime focus:outline-none cursor-pointer uppercase font-mono"
            >
              {exercisesWithHistory.map(ex => (
                <option key={ex.id} value={ex.id} className="bg-gym-card text-white uppercase font-bold text-xs">
                  {ex.name} {ex.hasHistory ? "✓" : "(Sin entrenamientos)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {exerciseStats && exerciseStats.history.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={exerciseStats.history}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis 
                  dataKey="date" 
                  stroke="#555555" 
                  fontSize={10} 
                  tickLine={false}
                  className="font-mono uppercase"
                />
                <YAxis 
                  stroke="#555555" 
                  fontSize={10} 
                  tickLine={false}
                  label={{ value: 'PESO (KG)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: '#888888', fontWeight: '900', fontFamily: 'monospace' } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', borderRadius: '0px', border: '2px solid #222222', fontSize: '11px', fontFamily: 'monospace', color: '#ffffff' }}
                  itemStyle={{ color: '#CCFF00' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxWeightInWorkout" 
                  name="PESO MÁXIMO"
                  stroke="#CCFF00" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#CCFF00', stroke: '#050505', strokeWidth: 2 }}
                  dot={{ r: 4, stroke: '#CCFF00', strokeWidth: 2, fill: '#050505' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 font-mono uppercase tracking-wider">
            <div className="flex h-12 w-12 items-center justify-center rounded-none bg-gym-card border border-gym-border text-slate-500">
              <Dumbbell className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs font-bold text-white">Sin datos registrados</p>
            <p className="max-w-xs text-[10px] text-slate-400 mt-1">
              Completa y guarda entrenamientos que incluyan el ejercicio <span className="font-bold text-neon-lime">"{currentExercise?.name}"</span> para visualizar tu progresión de cargas.
            </p>
          </div>
        )}
      </div>

      {/* Two-Column Chart Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Muscle Group Breakdown (Pie) */}
        <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-neon-lime" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">DISTRIBUCIÓN DE GRUPOS MUSCULARES //</h3>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-6">Equilibrio de entrenamiento por grupos musculares</p>

          {muscleGroupDistributionData.length > 0 ? (
            <div className="flex flex-col items-center justify-center sm:flex-row gap-6">
              <div className="h-56 w-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={muscleGroupDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {muscleGroupDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111111', borderRadius: '0px', border: '2px solid #222222', fontSize: '11px', fontFamily: 'monospace', color: '#ffffff' }}
                      formatter={(value) => [`${value} entrenamientos`, 'Sesiones']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend to make it neat and tight */}
              <div className="flex flex-col gap-2.5">
                {muscleGroupDistributionData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                    <span className="h-3 w-3 rounded-none shrink-0" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}</span>
                    <span className="text-neon-lime text-[10px] font-black">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 font-mono uppercase tracking-wider">
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-gym-card border border-gym-border text-slate-500">
                <PieIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-white">Sin estadísticas de distribución</p>
              <p className="max-w-xs text-[10px] text-slate-400 mt-1">Registra entrenamientos para ver el balance muscular.</p>
            </div>
          )}
        </div>

        {/* Workout Frequency (Monthly Bar Chart) */}
        <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-neon-lime" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">FRECUENCIA MENSUAL //</h3>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-6">Volumen de entrenamientos completados en los últimos 6 meses</p>

          {totalWorkouts > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyActivityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="month" stroke="#555555" fontSize={10} tickLine={false} className="font-mono uppercase" />
                  <YAxis stroke="#555555" fontSize={10} tickLine={false} allowDecimals={false} className="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', borderRadius: '0px', border: '2px solid #222222', fontSize: '11px', fontFamily: 'monospace', color: '#ffffff' }}
                    itemStyle={{ color: '#CCFF00' }}
                    cursor={{ fill: '#161616' }}
                  />
                  <Bar dataKey="entrenamientos" fill="#CCFF00" radius={[0, 0, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 font-mono uppercase tracking-wider">
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-gym-card border border-gym-border text-slate-500">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-white">Sin historial de actividad</p>
              <p className="max-w-xs text-[10px] text-slate-400 mt-1">Inicia y guarda entrenamientos para monitorizar tu frecuencia.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
