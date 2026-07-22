import { MuscleGroup, Exercise } from "./types";

export const DEFAULT_MUSCLE_GROUPS: MuscleGroup[] = [
  { id: "pecho", name: "Pecho", userId: null, order: 0, active: true, createdAt: new Date().toISOString(), color: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20", textClass: "text-red-500" },
  { id: "espalda", name: "Espalda", userId: null, order: 0, active: true, createdAt: new Date().toISOString(), color: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20", textClass: "text-blue-500" },
  { id: "piernas", name: "Piernas", userId: null, order: 0, active: true, createdAt: new Date().toISOString(), color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20", textClass: "text-emerald-500" },
  { id: "hombros", name: "Hombros", userId: null, order: 0, active: true, createdAt: new Date().toISOString(), color: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20", textClass: "text-orange-500" },
  { id: "brazos", name: "Brazos", userId: null, order: 0, active: true, createdAt: new Date().toISOString(), color: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20", textClass: "text-purple-500" },
  { id: "abdomen", name: "Abdomen", userId: null, order: 0, active: true, createdAt: new Date().toISOString(), color: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20", textClass: "text-amber-500" }
];

export const DEFAULT_EXERCISES: Exercise[] = [
  // Pecho
  { id: "ex_bench_press", name: "Press de Banca Plano", muscleGroupId: "pecho", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_incline_press", name: "Press de Banca Inclinado", muscleGroupId: "pecho", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_chest_fly", name: "Aperturas con Mancuernas", muscleGroupId: "pecho", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_pushups", name: "Flexiones", muscleGroupId: "pecho", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  
  // Espalda
  { id: "ex_pullups", name: "Dominadas", muscleGroupId: "espalda", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_lat_pulldown", name: "Jalón al Pecho", muscleGroupId: "espalda", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_barbell_row", name: "Remo con Barra", muscleGroupId: "espalda", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_deadlift", name: "Peso Muerto", muscleGroupId: "espalda", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },

  // Piernas
  { id: "ex_squat", name: "Sentadilla Libre", muscleGroupId: "piernas", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_leg_press", name: "Prensa de Piernas", muscleGroupId: "piernas", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_romanian_deadlift", name: "Peso Muerto Rumano", muscleGroupId: "piernas", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_leg_extension", name: "Extensión de Cuádriceps", muscleGroupId: "piernas", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },

  // Hombros
  { id: "ex_military_press", name: "Press Militar", muscleGroupId: "hombros", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_lateral_raise", name: "Elevaciones Laterales", muscleGroupId: "hombros", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_rear_delt_fly", name: "Pájaros (Deltoides Posterior)", muscleGroupId: "hombros", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_arnold_press", name: "Press Arnold", muscleGroupId: "hombros", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },

  // Brazos
  { id: "ex_barbell_curl", name: "Curl de Bíceps con Barra", muscleGroupId: "brazos", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_tricep_pushdown", name: "Extensión de Tríceps (Polea)", muscleGroupId: "brazos", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_hammer_curl", name: "Curl Martillo con Mancuernas", muscleGroupId: "brazos", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_tricep_dips", name: "Fondos de Tríceps en Paralelas", muscleGroupId: "brazos", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },

  // Abdomen
  { id: "ex_plank", name: "Plancha Abdominal", muscleGroupId: "abdomen", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_crunch", name: "Crunches Abdominales", muscleGroupId: "abdomen", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null },
  { id: "ex_leg_raise", name: "Elevación de Piernas Colgado", muscleGroupId: "abdomen", order: 0, initialWeight: 0, targetSets: 4, targetReps: 10, notes: "", active: true, userId: null }
];
