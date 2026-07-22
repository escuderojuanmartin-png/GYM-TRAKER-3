import React, { useState } from "react";
import { Plus, Trash2, Dumbbell, Layers } from "lucide-react";
import { Exercise, MuscleGroup } from "../types";

interface ExerciseManagerProps {
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  onAddExercise: (name: string, muscleGroupId: string) => void;
  onDeleteExercise: (id: string) => void;
  onAddMuscleGroup: (name: string) => void;
}

export default function ExerciseManager({
  exercises,
  muscleGroups,
  onAddExercise,
  onDeleteExercise,
  onAddMuscleGroup
}: ExerciseManagerProps) {
  
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [addingExerciseToGroup, setAddingExerciseToGroup] = useState<string | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");

  const handleAddGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    const exists = muscleGroups.some(g => g.name.toLowerCase() === newGroupName.trim().toLowerCase());
    if (exists) {
      alert("Ya existe un grupo muscular con este nombre.");
      return;
    }

    onAddMuscleGroup(newGroupName.trim());
    setNewGroupName("");
    setShowAddGroupForm(false);
  };

  const handleAddExerciseSubmit = (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    onAddExercise(newExerciseName.trim(), groupId);
    setNewExerciseName("");
    setAddingExerciseToGroup(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24 text-white">
      
      {/* Header and Add Group Action */}
      <div className="flex flex-col gap-4 mb-2">
        <h2 className="text-xl font-black uppercase tracking-wide">Ejercicios</h2>
        
        {!showAddGroupForm ? (
          <button
            onClick={() => setShowAddGroupForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-dashed border-gym-border-light bg-transparent hover:border-neon-lime hover:bg-gym-card-light text-slate-400 hover:text-white py-3 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo grupo muscular</span>
          </button>
        ) : (
          <form onSubmit={handleAddGroupSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del grupo..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-1 rounded-none border border-gym-border bg-gym-dark px-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:border-neon-lime focus:outline-none uppercase"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 bg-neon-lime text-black font-black text-xs uppercase tracking-wider hover:bg-neon-lime/80 transition-colors"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={() => setShowAddGroupForm(false)}
              className="px-3 bg-gym-card border border-gym-border text-slate-400 font-black text-xs uppercase hover:bg-gym-card-light hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>

      {/* Muscle Groups List */}
      <div className="space-y-8">
        {muscleGroups.map(group => {
          const groupExercises = exercises.filter(ex => ex.muscleGroupId === group.id);

          return (
            <div key={group.id} className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-gym-border pb-1 mb-2">
                {group.name}
              </h3>
              
              <div className="space-y-1">
                {groupExercises.map(ex => {
                  const isCustom = ex.userId !== null;
                  return (
                    <div key={ex.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-gym-card-light transition-colors group">
                      <span className="text-sm font-black text-white">{ex.name}</span>
                      {isCustom ? (
                        <button
                          onClick={() => onDeleteExercise(ex.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                          title="Eliminar ejercicio personalizado"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Base</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Exercise to Group */}
              {addingExerciseToGroup === group.id ? (
                <form onSubmit={(e) => handleAddExerciseSubmit(e, group.id)} className="flex gap-2 mt-2 pl-2">
                  <input
                    type="text"
                    placeholder="Nombre del ejercicio..."
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    className="flex-1 rounded-none border border-gym-border-light bg-gym-dark px-2 py-1.5 text-xs font-bold text-white placeholder-slate-500 focus:border-neon-lime focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingExerciseToGroup(null)}
                    className="px-2 text-slate-500 font-black text-xs uppercase hover:text-white transition-colors"
                  >
                    X
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setAddingExerciseToGroup(group.id);
                    setNewExerciseName("");
                  }}
                  className="flex items-center gap-1.5 text-neon-lime text-xs font-black uppercase tracking-wider mt-2 py-1 px-2 hover:bg-neon-lime/10 transition-colors w-fit cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Añadir a {group.name}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
