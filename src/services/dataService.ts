import { db, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "../firebase";
import { MuscleGroup, Exercise, Workout, Routine, ExerciseHistoryStat, WorkoutSet } from "../types";
import { DEFAULT_MUSCLE_GROUPS, DEFAULT_EXERCISES } from "../defaultData";

// LocalStorage Keys for Guest Mode
const KEY_WORKOUTS = "gym_tracker_workouts";
const KEY_ROUTINES = "gym_tracker_routines";
const KEY_CUSTOM_EXERCISES = "gym_tracker_custom_exercises";
const KEY_CUSTOM_MUSCLE_GROUPS = "gym_tracker_custom_muscle_groups";
const KEY_WEEKLY_GOAL = "gym_tracker_weekly_goal";

export class DataService {
  private userId: string | null = null;

  constructor(userId: string | null) {
    this.userId = userId;
  }

  // Set the current user ID
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  // --- MUSCLE GROUPS ---
  async getMuscleGroups(): Promise<MuscleGroup[]> {
    if (!this.userId) {
      // Offline mode
      const local = localStorage.getItem(KEY_CUSTOM_MUSCLE_GROUPS);
      const custom: MuscleGroup[] = local ? JSON.parse(local) : [];
      return [...DEFAULT_MUSCLE_GROUPS, ...custom];
    }

    try {
      const q = query(collection(db, "muscle_groups"), where("userId", "==", this.userId));
      const querySnapshot = await getDocs(q);
      const custom: MuscleGroup[] = [];
      querySnapshot.forEach((docSnap) => {
        custom.push({ id: docSnap.id, ...docSnap.data() } as MuscleGroup);
      });
      return [...DEFAULT_MUSCLE_GROUPS, ...custom];
    } catch (e) {
      console.error("Error fetching muscle groups from Firestore:", e);
      return DEFAULT_MUSCLE_GROUPS;
    }
  }

  async addMuscleGroup(name: string): Promise<MuscleGroup> {
    const id = "custom_mg_" + Date.now();
    const colors = [
      { color: "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20", textClass: "text-pink-500" },
      { color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20", textClass: "text-indigo-500" },
      { color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20", textClass: "text-cyan-500" },
      { color: "bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20", textClass: "text-teal-500" }
    ];
    const pickedColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newGroup: MuscleGroup = {
      id,
      name,
      ...pickedColor,
      order: 0,
      active: true,
      createdAt: new Date().toISOString(),
      userId: this.userId || null
    };

    if (!this.userId) {
      const local = localStorage.getItem(KEY_CUSTOM_MUSCLE_GROUPS);
      const custom: MuscleGroup[] = local ? JSON.parse(local) : [];
      custom.push(newGroup);
      localStorage.setItem(KEY_CUSTOM_MUSCLE_GROUPS, JSON.stringify(custom));
      return newGroup;
    }

    try {
      await setDoc(doc(db, "muscle_groups", id), {
        name: newGroup.name,
        color: newGroup.color,
        textClass: newGroup.textClass,
        order: 0,
        active: true,
        createdAt: new Date().toISOString(),
        userId: this.userId
      });
      return newGroup;
    } catch (e) {
      console.error("Error saving custom muscle group to Firestore:", e);
      return newGroup;
    }
  }

  // --- EXERCISES ---
  async getExercises(): Promise<Exercise[]> {
    if (!this.userId) {
      const local = localStorage.getItem(KEY_CUSTOM_EXERCISES);
      const custom: Exercise[] = local ? JSON.parse(local) : [];
      return [...DEFAULT_EXERCISES, ...custom];
    }

    try {
      const q = query(collection(db, "exercises"), where("userId", "==", this.userId));
      const querySnapshot = await getDocs(q);
      const custom: Exercise[] = [];
      querySnapshot.forEach((docSnap) => {
        custom.push({ id: docSnap.id, ...docSnap.data() } as Exercise);
      });
      return [...DEFAULT_EXERCISES, ...custom];
    } catch (e) {
      console.error("Error fetching exercises from Firestore:", e);
      return DEFAULT_EXERCISES;
    }
  }

  async addExercise(name: string, muscleGroupId: string): Promise<Exercise> {
    const id = "custom_ex_" + Date.now();
    const newEx: Exercise = {
      id,
      name,
      muscleGroupId,
      order: 0, 
      initialWeight: 0, 
      targetSets: 4, 
      targetReps: 10, 
      notes: "", 
      active: true, 
      userId: this.userId || null
    };

    if (!this.userId) {
      const local = localStorage.getItem(KEY_CUSTOM_EXERCISES);
      const custom: Exercise[] = local ? JSON.parse(local) : [];
      custom.push(newEx);
      localStorage.setItem(KEY_CUSTOM_EXERCISES, JSON.stringify(custom));
      return newEx;
    }

    try {
      await setDoc(doc(db, "exercises", id), {
        name,
        muscleGroupId,
        order: 0,
        initialWeight: 0,
        targetSets: 4,
        targetReps: 10,
        notes: "",
        active: true,
        userId: this.userId
      });
      return newEx;
    } catch (e) {
      console.error("Error saving custom exercise to Firestore:", e);
      return newEx;
    }
  }

  async deleteExercise(id: string): Promise<void> {
    if (!this.userId) {
      const local = localStorage.getItem(KEY_CUSTOM_EXERCISES);
      if (local) {
        const custom: Exercise[] = JSON.parse(local);
        const filtered = custom.filter(ex => ex.id !== id);
        localStorage.setItem(KEY_CUSTOM_EXERCISES, JSON.stringify(filtered));
      }
      return;
    }

    try {
      await deleteDoc(doc(db, "exercises", id));
    } catch (e) {
      console.error("Error deleting exercise from Firestore:", e);
    }
  }

  // --- ROUTINES ---
  async getRoutines(): Promise<Routine[]> {
    if (!this.userId) {
      const local = localStorage.getItem(KEY_ROUTINES);
      return local ? JSON.parse(local) : [];
    }

    try {
      const q = query(collection(db, "routines"), where("userId", "==", this.userId));
      const querySnapshot = await getDocs(q);
      const routines: Routine[] = [];
      querySnapshot.forEach((docSnap) => {
        routines.push({ id: docSnap.id, ...docSnap.data() } as Routine);
      });
      return routines;
    } catch (e) {
      console.error("Error fetching routines from Firestore:", e);
      return [];
    }
  }

  async addRoutine(name: string, exerciseIds: string[], muscleGroupIds: string[]): Promise<Routine> {
    const id = "routine_" + Date.now();
    const newRoutine: Routine = {
      id,
      userId: this.userId || "guest",
      name,
      exerciseIds,
      muscleGroupIds
    };

    if (!this.userId) {
      const local = localStorage.getItem(KEY_ROUTINES);
      const routines: Routine[] = local ? JSON.parse(local) : [];
      routines.push(newRoutine);
      localStorage.setItem(KEY_ROUTINES, JSON.stringify(routines));
      return newRoutine;
    }

    try {
      await setDoc(doc(db, "routines", id), {
        userId: this.userId,
        name,
        exerciseIds,
        muscleGroupIds
      });
      return newRoutine;
    } catch (e) {
      console.error("Error saving routine to Firestore:", e);
      return newRoutine;
    }
  }

  async updateRoutine(id: string, name: string, exerciseIds: string[], muscleGroupIds: string[]): Promise<void> {
    if (!this.userId) {
      const local = localStorage.getItem(KEY_ROUTINES);
      if (local) {
        const routines: Routine[] = JSON.parse(local);
        const updated = routines.map(r => r.id === id ? { ...r, name, exerciseIds, muscleGroupIds } : r);
        localStorage.setItem(KEY_ROUTINES, JSON.stringify(updated));
      }
      return;
    }

    try {
      await updateDoc(doc(db, "routines", id), {
        name,
        exerciseIds,
        muscleGroupIds
      });
    } catch (e) {
      console.error("Error updating routine in Firestore:", e);
    }
  }

  async deleteRoutine(id: string): Promise<void> {
    if (!this.userId) {
      const local = localStorage.getItem(KEY_ROUTINES);
      if (local) {
        const routines: Routine[] = JSON.parse(local);
        const filtered = routines.filter(r => r.id !== id);
        localStorage.setItem(KEY_ROUTINES, JSON.stringify(filtered));
      }
      return;
    }

    try {
      await deleteDoc(doc(db, "routines", id));
    } catch (e) {
      console.error("Error deleting routine from Firestore:", e);
    }
  }

  // --- WORKOUTS ---
  async getWorkouts(): Promise<Workout[]> {
    if (!this.userId) {
      console.log("[DataService] getWorkouts: no userId, reading from localStorage");
      const local = localStorage.getItem(KEY_WORKOUTS);
      const list: Workout[] = local ? JSON.parse(local) : [];
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    console.log("[DataService] getWorkouts: querying Firestore for userId=", this.userId);
    try {
      const q = query(
        collection(db, "workouts"), 
        where("userId", "==", this.userId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const workouts: Workout[] = [];
      querySnapshot.forEach((docSnap) => {
        workouts.push({ id: docSnap.id, ...docSnap.data() } as Workout);
      });
      console.log("[DataService] getWorkouts: found", workouts.length, "workouts");
      return workouts;
    } catch (e: any) {
      console.error("[DataService] getWorkouts FAILED (primary query):", e?.code, e?.message);
      // Fallback query without orderBy (no composite index needed)
      try {
        const qNoOrder = query(collection(db, "workouts"), where("userId", "==", this.userId));
        const querySnapshot = await getDocs(qNoOrder);
        const workouts: Workout[] = [];
        querySnapshot.forEach((docSnap) => {
          workouts.push({ id: docSnap.id, ...docSnap.data() } as Workout);
        });
        console.log("[DataService] getWorkouts fallback: found", workouts.length, "workouts");
        return workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (innerError: any) {
        console.error("[DataService] getWorkouts FAILED (fallback query):", innerError?.code, innerError?.message);
        throw innerError; // bubble up so App.tsx can show the error
      }
    }
  }

  async addWorkout(workoutData: Omit<Workout, "id" | "userId">): Promise<Workout> {
    const id = "workout_" + Date.now();
    const newWorkout: Workout = {
      id,
      userId: this.userId || "guest",
      ...workoutData
    };

    console.log("[DataService] addWorkout: userId=", this.userId, "id=", id);

    if (!this.userId) {
      console.warn("[DataService] addWorkout: NO userId — saving to localStorage (guest mode)");
      const local = localStorage.getItem(KEY_WORKOUTS);
      const list: Workout[] = local ? JSON.parse(local) : [];
      list.push(newWorkout);
      localStorage.setItem(KEY_WORKOUTS, JSON.stringify(list));
      return newWorkout;
    }

    try {
      console.log("[DataService] addWorkout: writing to Firestore collection 'workouts', doc id=", id);
      await setDoc(doc(db, "workouts", id), {
        userId: this.userId,
        ...workoutData
      });
      console.log("[DataService] addWorkout: Firestore write SUCCESS");
      return newWorkout;
    } catch (e: any) {
      console.error("[DataService] addWorkout FAILED:", e?.code, e?.message);
      throw e;
    }
  }

  async deleteWorkout(id: string): Promise<void> {
    if (!this.userId) {
      const local = localStorage.getItem(KEY_WORKOUTS);
      if (local) {
        const list: Workout[] = JSON.parse(local);
        const filtered = list.filter(w => w.id !== id);
        localStorage.setItem(KEY_WORKOUTS, JSON.stringify(filtered));
      }
      return;
    }

    try {
      await deleteDoc(doc(db, "workouts", id));
    } catch (e) {
      console.error("Error deleting workout from Firestore:", e);
    }
  }

  // --- WEEKLY GOAL ---
  async getWeeklyGoal(): Promise<number> {
    const defaultGoal = 4;
    if (!this.userId) {
      const local = localStorage.getItem(KEY_WEEKLY_GOAL);
      return local ? parseInt(local, 10) : defaultGoal;
    }

    try {
      const docRef = doc(db, "user_goals", this.userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().weeklyWorkoutCount || defaultGoal;
      }
      return defaultGoal;
    } catch (e) {
      console.error("Error fetching weekly goal:", e);
      return defaultGoal;
    }
  }

  async saveWeeklyGoal(goal: number): Promise<void> {
    if (!this.userId) {
      localStorage.setItem(KEY_WEEKLY_GOAL, goal.toString());
      return;
    }

    try {
      await setDoc(doc(db, "user_goals", this.userId), {
        weeklyWorkoutCount: goal
      }, { merge: true });
    } catch (e) {
      console.error("Error saving weekly goal:", e);
    }
  }

  // --- STATS COMPUTATIONS ---
  
  // 1. Get stats for a specific exercise: last used weight, max weight ever, and progression history
  getExerciseHistory(workouts: Workout[], exerciseId: string): ExerciseHistoryStat {
    let lastWeight = 0;
    let maxWeight = 0;
    const history: { date: string; maxWeightInWorkout: number }[] = [];

    // Filter workouts that have this exercise and sort ascending by date to build the progression timeline
    const relevantWorkouts = workouts
      .filter(w => w.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    relevantWorkouts.forEach(workout => {
      const exerciseEntry = workout.exercises.find(e => e.exerciseId === exerciseId);
      if (exerciseEntry) {
        // Find maximum completed weight in this specific workout session
        const completedSets = exerciseEntry.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const maxInWorkout = Math.max(...completedSets.map(s => s.weight));
          
          if (maxInWorkout > maxWeight) {
            maxWeight = maxInWorkout;
          }
          
          history.push({
            date: workout.date.split("T")[0],
            maxWeightInWorkout: maxInWorkout
          });
        }
      }
    });

    // Last weight is from the absolute most recent workout where this exercise was completed
    if (relevantWorkouts.length > 0) {
      const lastWorkout = relevantWorkouts[relevantWorkouts.length - 1];
      const lastExerciseEntry = lastWorkout.exercises.find(e => e.exerciseId === exerciseId);
      if (lastExerciseEntry) {
        const completedSets = lastExerciseEntry.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          lastWeight = Math.max(...completedSets.map(s => s.weight));
        }
      }
    }

    return {
      lastWeight,
      maxWeight,
      history
    };
  }

  // 2. Rolling 7-day Goal Tracker
  getWeeklyRollingStats(workouts: Workout[], weeklyGoal: number) {
    const now = new Date();
    // Start of rolling 7 days ago
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const workoutsThisWeek = workouts.filter(w => {
      const wDate = new Date(w.date);
      return wDate >= sevenDaysAgo;
    });

    const count = workoutsThisWeek.length;
    const percentage = weeklyGoal > 0 ? Math.min(100, Math.round((count / weeklyGoal) * 100)) : 100;

    return {
      count,
      goal: weeklyGoal,
      percentage,
      workouts: workoutsThisWeek
    };
  }

  // 3. Muscle Group Recommendations (Ranked by time since last trained)
  getMuscleGroupRecommendations(workouts: Workout[], allMuscleGroups: MuscleGroup[]): { group: MuscleGroup; daysSinceLast: number | null; lastDate: string | null }[] {
    const result = allMuscleGroups.map(group => {
      // Find latest workout that trained this group
      const relevantWorkouts = workouts.filter(w => w.muscleGroupIds.includes(group.id));
      if (relevantWorkouts.length === 0) {
        return {
          group,
          daysSinceLast: null, // Never trained, high priority
          lastDate: null
        };
      }

      // Sort to find the latest
      const latestWorkout = relevantWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const lastDate = latestWorkout.date;
      
      const diffTime = Math.abs(new Date().getTime() - new Date(lastDate).getTime());
      const daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        group,
        daysSinceLast,
        lastDate: lastDate.split("T")[0]
      };
    });

    // Sort:
    // 1. Never trained first (daysSinceLast is null), ordered by group ID or default rank
    // 2. Ttrained longest ago next (daysSinceLast descending)
    return result.sort((a, b) => {
      if (a.daysSinceLast === null && b.daysSinceLast !== null) return -1;
      if (a.daysSinceLast !== null && b.daysSinceLast === null) return 1;
      if (a.daysSinceLast === null && b.daysSinceLast === null) return 0;
      
      // Both have been trained, recommend the one with more days since last training
      return (b.daysSinceLast as number) - (a.daysSinceLast as number);
    });
  }

  // --- LOCAL DATA TO CLOUD MIGRATION ---
  async migrateLocalDataToCloud(): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // 1. Muscle groups
      const localGroups = localStorage.getItem(KEY_CUSTOM_MUSCLE_GROUPS);
      if (localGroups) {
        const groups: MuscleGroup[] = JSON.parse(localGroups);
        for (const g of groups) {
          await setDoc(doc(db, "muscle_groups", g.id), {
            name: g.name,
            color: g.color,
            textClass: g.textClass,
            order: g.order || 0,
            active: g.active !== undefined ? g.active : true,
            createdAt: g.createdAt || new Date().toISOString(),
            userId: this.userId
          });
        }
        localStorage.removeItem(KEY_CUSTOM_MUSCLE_GROUPS);
      }

      // 2. Exercises
      const localEx = localStorage.getItem(KEY_CUSTOM_EXERCISES);
      if (localEx) {
        const exercises: Exercise[] = JSON.parse(localEx);
        for (const ex of exercises) {
          await setDoc(doc(db, "exercises", ex.id), {
            name: ex.name,
            muscleGroupId: ex.muscleGroupId,
            order: ex.order || 0,
            initialWeight: ex.initialWeight || 0,
            targetSets: ex.targetSets || 4,
            targetReps: ex.targetReps || 10,
            notes: ex.notes || "",
            active: ex.active !== undefined ? ex.active : true,
            userId: this.userId
          });
        }
        localStorage.removeItem(KEY_CUSTOM_EXERCISES);
      }

      // 3. Routines
      const localRoutines = localStorage.getItem(KEY_ROUTINES);
      if (localRoutines) {
        const routines: Routine[] = JSON.parse(localRoutines);
        for (const r of routines) {
          await setDoc(doc(db, "routines", r.id), {
            userId: this.userId,
            name: r.name,
            exerciseIds: r.exerciseIds,
            muscleGroupIds: r.muscleGroupIds
          });
        }
        localStorage.removeItem(KEY_ROUTINES);
      }

      // 4. Workouts
      const localWorkouts = localStorage.getItem(KEY_WORKOUTS);
      if (localWorkouts) {
        const workouts: Workout[] = JSON.parse(localWorkouts);
        for (const w of workouts) {
          // Exclude id and userId from body and let Firestore handle it or set it manually
          const { id, userId, ...body } = w;
          await setDoc(doc(db, "workouts", id), {
            userId: this.userId,
            ...body
          });
        }
        localStorage.removeItem(KEY_WORKOUTS);
      }

      // 5. Goal
      const localGoal = localStorage.getItem(KEY_WEEKLY_GOAL);
      if (localGoal) {
        await this.saveWeeklyGoal(parseInt(localGoal, 10));
        localStorage.removeItem(KEY_WEEKLY_GOAL);
      }

      return true;
    } catch (e) {
      console.error("Migration failed:", e);
      return false;
    }
  }

  // Helper to check if any migration is available
  hasLocalDataToMigrate(): boolean {
    return !!(
      localStorage.getItem(KEY_CUSTOM_MUSCLE_GROUPS) ||
      localStorage.getItem(KEY_CUSTOM_EXERCISES) ||
      localStorage.getItem(KEY_ROUTINES) ||
      localStorage.getItem(KEY_WORKOUTS)
    );
  }
}
