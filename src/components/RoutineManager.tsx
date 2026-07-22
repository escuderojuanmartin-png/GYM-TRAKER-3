import React, { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Play, Check, X, Dumbbell, FolderPlus, HelpCircle } from "lucide-react";
import { Routine, Exercise, MuscleGroup } from "../types";

interface RoutineManagerProps {
  routines: Routine[];
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  onAddRoutine: (name: string, exerciseIds: string[], muscleGroupIds: string[]) => void;
  onUpdateRoutine: (id: string, name: string, exerciseIds: string[], muscleGroupIds: string[]) => void;
  onDeleteRoutine: (id: string) => void;
  onStartRoutine: (routine: Routine) => void;
}

export default function RoutineManager({
  routines,
  exercises,
  muscleGroups,
  onAddRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
  onStartRoutine
}: RoutineManagerProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  // Open creation modal/form
  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditingId(null);
    setName("");
    setSelectedExerciseIds([]);
  };

  // Open edit modal/form
  const handleOpenEdit = (routine: Routine) => {
    setIsEditing(true);
    setEditingId(routine.id);
    setName(routine.name);
    setSelectedExerciseIds(routine.exerciseIds);
  };

  // Toggle exercise selection
  const handleToggleExercise = (exId: string) => {
    setSelectedExerciseIds(prev => 
      prev.includes(exId) ? prev.filter(id => id !== exId) : [...prev, exId]
    );
  };

  // Compute selected muscle groups based on selected exercises
  const computedMuscleGroupIds = useMemo(() => {
    const ids = new Set<string>();
    selectedExerciseIds.forEach(exId => {
      const ex = exercises.find(e => e.id === exId);
      if (ex) {
        ids.add(ex.muscleGroupId);
      }
    });
    return Array.from(ids);
  }, [selectedExerciseIds, exercises]);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor escribe un nombre para la rutina.");
      return;
    }
    if (selectedExerciseIds.length === 0) {
      alert("Por favor selecciona al menos un ejercicio.");
      return;
    }

    if (editingId) {
      onUpdateRoutine(editingId, name, selectedExerciseIds, computedMuscleGroupIds);
    } else {
      onAddRoutine(name, selectedExerciseIds, computedMuscleGroupIds);
    }

    setIsEditing(false);
    setEditingId(null);
    setName("");
    setSelectedExerciseIds([]);
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* Header and Add Button */}
      {!isEditing && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">TUS RUTINAS PERSONALIZADAS //</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wide">Crea plantillas fijas de ejercicios para agilizar tus entrenamientos.</p>
          </div>
          
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-none bg-neon-lime px-4 py-2.5 text-xs font-black text-black hover:bg-[#bce600] transition-all cursor-pointer shadow-md uppercase tracking-widest"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Nueva Rutina</span>
          </button>
        </div>
      )}

      {/* Routine list or active editor form */}
      {isEditing ? (
        <div className="rounded-none border-2 border-gym-border-light bg-gym-card p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-gym-border">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              {editingId ? "EDITAR RUTINA //" : "CREAR NUEVA RUTINA //"}
            </h4>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-none border border-gym-border p-1 text-slate-400 hover:bg-gym-card-light hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="text-xxs font-black uppercase tracking-widest text-slate-400">NOMBRE DE LA RUTINA</label>
              <input
                type="text"
                placeholder="Ej. Torso, Tirón (Pull), Pierna y Core..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-none border border-gym-border bg-gym-dark px-4 py-2.5 text-xs text-white focus:border-neon-lime focus:bg-gym-card-light focus:outline-none font-bold uppercase placeholder-slate-500"
                required
              />
            </div>

            {/* Exercise Selector Grid grouped by Muscle Group */}
            <div>
              <label className="text-xxs font-black uppercase tracking-widest text-slate-400">EJERCICIOS INCLUIDOS</label>
              <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-wider font-mono">Selecciona los ejercicios que componen esta rutina.</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-h-80 overflow-y-auto border-2 border-gym-border rounded-none p-3 bg-gym-dark">
                {muscleGroups.map(group => {
                  const groupExercises = exercises.filter(ex => ex.muscleGroupId === group.id);
                  if (groupExercises.length === 0) return null;

                  return (
                    <div key={group.id} className="space-y-2 border-b border-gym-border/30 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-none ${
                          group.color.includes("red") ? "bg-[#FF3366]" :
                          group.color.includes("blue") ? "bg-[#33CCFF]" :
                          group.color.includes("emerald") ? "bg-[#00FF99]" :
                          group.color.includes("orange") ? "bg-[#FF9933]" :
                          group.color.includes("purple") ? "bg-[#CC33FF]" : "bg-[#FFCC00]"
                        }`} />
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-neon-lime">{group.name}</h5>
                      </div>

                      <div className="space-y-1.5 pl-3">
                        {groupExercises.map(ex => {
                          const isSelected = selectedExerciseIds.includes(ex.id);
                          return (
                            <button
                              type="button"
                              key={ex.id}
                              onClick={() => handleToggleExercise(ex.id)}
                              className={`flex w-full items-center justify-between rounded-none px-2.5 py-1.5 text-left text-xs font-bold uppercase border transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-neon-lime/10 border-neon-lime text-neon-lime" 
                                  : "bg-gym-card border-gym-border hover:border-gym-border-light text-slate-400"
                              }`}
                            >
                              <span>{ex.name}</span>
                              <div className={`h-4.5 w-4.5 rounded-none flex items-center justify-center border transition-all ${
                                isSelected 
                                  ? "bg-neon-lime border-neon-lime text-black" 
                                  : "border-gym-border-light bg-gym-dark"
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

            {/* Footer Form Action Buttons */}
            <div className="flex gap-3 justify-end pt-3 border-t-2 border-gym-border">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-none border border-gym-border bg-gym-dark px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-none bg-white hover:bg-neutral-200 px-5 py-2 text-xs font-black uppercase tracking-widest text-black cursor-pointer"
              >
                {editingId ? "Actualizar" : "Crear Rutina"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Routine cards display list */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {routines.length === 0 ? (
            <div className="col-span-full rounded-none border-2 border-dashed border-gym-border-light bg-gym-card/40 p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center bg-gym-card-light border border-gym-border text-slate-500">
                <FolderPlus className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-black text-white uppercase tracking-wider">No tienes rutinas todavía</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto uppercase font-mono tracking-wide">
                Crea rutinas fijas para acelerar tu llegada al gimnasio y registrar series de forma óptima.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-none bg-neon-lime px-4 py-2 text-xs font-black text-black hover:bg-[#bce600] shadow-sm cursor-pointer uppercase tracking-widest"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Crear Primera Rutina</span>
              </button>
            </div>
          ) : (
            routines.map(routine => (
              <div 
                key={routine.id}
                className="flex flex-col justify-between rounded-none border-2 border-gym-border-light bg-gym-card p-5 shadow-xl hover:border-neon-lime transition-all duration-150 group"
              >
                <div>
                  {/* Title and edit buttons */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wide">{routine.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase tracking-widest">{routine.exerciseIds.length} EJERCICIOS REGISTRADOS</p>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-65 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(routine)}
                        className="p-1 rounded-none text-slate-400 hover:bg-gym-card-light hover:text-neon-lime border border-transparent hover:border-gym-border transition-colors cursor-pointer"
                        title="Editar rutina"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="p-1 rounded-none text-slate-400 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-colors cursor-pointer"
                        title="Eliminar rutina"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Muscle Groups badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {routine.muscleGroupIds.map(mgId => {
                      const mg = muscleGroups.find(g => g.id === mgId);
                      if (!mg) return null;
                      return (
                        <span 
                          key={mgId} 
                          className={`rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-gym-border bg-gym-dark text-slate-300`}
                        >
                          {mg.name}
                        </span>
                      );
                    })}
                  </div>

                  {/* Included Exercises Previews list */}
                  <div className="mt-4 pt-3 border-t-2 border-gym-border space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-neon-lime">EJERCICIOS:</p>
                    <ul className="text-xxs font-mono uppercase tracking-wider text-slate-300 space-y-1">
                      {routine.exerciseIds.slice(0, 4).map(exId => {
                        const ex = exercises.find(e => e.id === exId);
                        return (
                          <li key={exId} className="flex items-center gap-1.5 truncate">
                            <Dumbbell className="h-2.5 w-2.5 text-neon-lime shrink-0" />
                            <span>{ex?.name || "Ejercicio"}</span>
                          </li>
                        );
                      })}
                      {routine.exerciseIds.length > 4 && (
                        <li className="text-neon-lime font-black text-[10px] pl-4 uppercase tracking-widest">
                          + {routine.exerciseIds.length - 4} EJERCICIOS MÁS...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Quick Start Workout Action */}
                <button
                  onClick={() => onStartRoutine(routine)}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-none bg-white hover:bg-neon-lime hover:text-black text-black py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Empezar Entrenamiento</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
