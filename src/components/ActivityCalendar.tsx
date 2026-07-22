import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Eye } from "lucide-react";
import { Workout, MuscleGroup } from "../types";

interface ActivityCalendarProps {
  workouts: Workout[];
  muscleGroups: MuscleGroup[];
  onViewWorkout: (workout: Workout) => void;
}

export default function ActivityCalendar({
  workouts,
  muscleGroups,
  onViewWorkout
}: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to change month
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get month name in Spanish
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Generate days for the grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Calculate offset to start week on Monday (0 = Monday, ..., 6 = Sunday)
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6; // Sunday is 6

  const totalDays = lastDayOfMonth.getDate();

  // Days from previous month to pad the grid
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateString: ""
    });
  }

  // Days in current month
  const currentMonthDays = [];
  for (let d = 1; d <= totalDays; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    currentMonthDays.push({
      day: d,
      isCurrentMonth: true,
      dateString: dStr
    });
  }

  const allDays = [...prevMonthDays, ...currentMonthDays];
  // Pad with days of next month to complete the row grid of 7 (multiple of 7)
  const remainingSlots = 42 - allDays.length; // 6 rows standard grid
  const nextMonthDays = [];
  for (let i = 1; i <= remainingSlots; i++) {
    nextMonthDays.push({
      day: i,
      isCurrentMonth: false,
      dateString: ""
    });
  }

  const gridDays = [...allDays, ...nextMonthDays];

  // Find workouts on a specific date (YYYY-MM-DD)
  const getWorkoutsForDate = (dateStr: string): Workout[] => {
    if (!dateStr) return [];
    return workouts.filter(w => w.date.startsWith(dateStr));
  };

  const daysOfWeek = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  return (
    <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-neon-lime" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">CALENDARIO DE ACTIVIDAD //</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-none border border-gym-border bg-gym-dark p-0.5">
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-none text-slate-400 hover:text-white hover:bg-gym-card-light cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-black text-white min-w-[90px] text-center uppercase tracking-wider font-mono">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-none text-slate-400 hover:text-white hover:bg-gym-card-light cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week Headers */}
      <div className="grid grid-cols-7 text-center mb-1">
        {daysOfWeek.map((day, idx) => (
          <span key={idx} className="text-xxs font-black uppercase text-neon-lime py-1 tracking-widest">
            {day}
          </span>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((slot, idx) => {
          const dayWorkouts = slot.isCurrentMonth ? getWorkoutsForDate(slot.dateString) : [];
          const hasWorkout = dayWorkouts.length > 0;
          const isToday = slot.isCurrentMonth && 
            new Date().getDate() === slot.day && 
            new Date().getMonth() === month && 
            new Date().getFullYear() === year;

          return (
            <div
              key={idx}
              className={`group relative flex aspect-square flex-col items-center justify-between rounded-none border p-1 transition-all ${
                slot.isCurrentMonth
                  ? hasWorkout 
                    ? "bg-gym-card-light border-neon-lime text-white" 
                    : "bg-gym-dark border-gym-border hover:border-gym-border-light text-white"
                  : "bg-gym-dark/10 border-transparent text-slate-600"
              } ${isToday ? "ring-2 ring-neon-lime ring-offset-2 ring-offset-gym-dark" : ""}`}
            >
              {/* Day Number */}
              <span
                className={`text-xs font-black font-mono ${
                  isToday 
                    ? "text-neon-lime" 
                    : slot.isCurrentMonth 
                      ? "text-white" 
                      : "text-slate-600"
                }`}
              >
                {slot.day}
              </span>

              {/* Workout Dots/Badges */}
              <div className="flex flex-wrap justify-center gap-0.5 max-w-full">
                {dayWorkouts.map((workout, wIdx) => {
                  // For each workout, draw small colored dots of muscle groups trained
                  return workout.muscleGroupIds.map((mgId, mgIdx) => {
                    const mg = muscleGroups.find(g => g.id === mgId);
                    // Match tailwind color from muscleGroup object or defaults
                    let colorDot = "bg-neon-lime";
                    if (mg) {
                      if (mg.color.includes("red")) colorDot = "bg-[#FF3366]";
                      else if (mg.color.includes("blue")) colorDot = "bg-[#33CCFF]";
                      else if (mg.color.includes("emerald")) colorDot = "bg-[#00FF99]";
                      else if (mg.color.includes("orange")) colorDot = "bg-[#FF9933]";
                      else if (mg.color.includes("purple")) colorDot = "bg-[#CC33FF]";
                      else if (mg.color.includes("amber")) colorDot = "bg-[#FFCC00]";
                    }
                    return (
                      <span
                        key={`${workout.id}-${mgId}-${mgIdx}`}
                        className={`h-1.5 w-1.5 rounded-none ${colorDot}`}
                        title={mg?.name || "Grupo Muscular"}
                      />
                    );
                  });
                })}
              </div>

              {/* Hover Details overlay click trigger */}
              {hasWorkout && (
                <button
                  onClick={() => onViewWorkout(dayWorkouts[0])}
                  className="absolute inset-0 flex items-center justify-center rounded-none bg-neon-lime text-black opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  title="Ver entrenamiento"
                >
                  <Eye className="h-4 w-4 stroke-[3]" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t-2 border-gym-border pt-3 text-xxs text-slate-400 font-mono uppercase tracking-wider">
        <span className="font-black text-slate-300">GRUPOS MUSCULARES:</span>
        {muscleGroups.map(mg => {
          let dotColor = "bg-neon-lime";
          if (mg.color.includes("red")) dotColor = "bg-[#FF3366]";
          else if (mg.color.includes("blue")) dotColor = "bg-[#33CCFF]";
          else if (mg.color.includes("emerald")) dotColor = "bg-[#00FF99]";
          else if (mg.color.includes("orange")) dotColor = "bg-[#FF9933]";
          else if (mg.color.includes("purple")) dotColor = "bg-[#CC33FF]";
          else if (mg.color.includes("amber")) dotColor = "bg-[#FFCC00]";

          return (
            <div key={mg.id} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-none ${dotColor}`} />
              <span>{mg.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
