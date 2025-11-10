import { Timestamp } from 'firebase/firestore';
import { MuscleGroup } from '../data/defaultExercises';

export interface ExerciseOption {
  exerciseName: string;
  muscleGroup: MuscleGroup;
  source: 'default' | 'custom';
  exerciseId?: string;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
}

export interface LoggedSetDocument {
  user: string;
  exercise: string;
  selectedMuscleGroup: MuscleGroup;
  timestamp: Timestamp | null;
  exerciseSets: ExerciseSet[];
}

export interface LoggedSet extends LoggedSetDocument {
  id: string;
}

export interface UserExerciseDocument {
  user: string;
  musclegroup: MuscleGroup;
  exercise: string;
}

export interface UserExercise extends UserExerciseDocument {
  id: string;
}

export interface WeighInDocument {
  user: string;
  weight: number;
  timestamp: Timestamp | null;
}

export interface WeighIn extends WeighInDocument {
  id: string;
}

