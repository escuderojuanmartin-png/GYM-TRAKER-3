export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastLogin: string;
}

export interface MuscleGroup {
  id: string;
  userId: string | null;
  name: string;
  order: number;
  active: boolean;
  createdAt: string;
  color: string; // Tailwind bg color class
  textClass: string; // Tailwind text color class
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroupId: string;
  order: number;
  initialWeight: number;
  targetSets: number;
  targetReps: number;
  notes: string;
  active: boolean;
  userId: string | null;
}

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroupId: string;
  order: number;
  completed: boolean;
  sets: WorkoutSet[];
}

export type WorkoutStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Workout {
  id: string;
  userId: string;
  primaryMuscleGroupId: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  duration: number; // in minutes
  status: WorkoutStatus;
  notes: string;
  exercises: WorkoutExercise[];
  muscleGroupIds: string[]; // Keeping for UI compatibility
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  exerciseIds: string[];
  muscleGroupIds: string[];
}

export interface Settings {
  userId: string;
  weeklyGoal: number;
  weightUnit: string;
  theme: string;
  language: string;
}

export interface UserStats {
  totalWorkouts: number;
  weeklyGoal: number; // workouts per week
  completedThisWeek: number;
}

export interface ExerciseHistoryStat {
  lastWeight: number;
  maxWeight: number;
  history: {
    date: string;
    maxWeightInWorkout: number;
  }[];
}
