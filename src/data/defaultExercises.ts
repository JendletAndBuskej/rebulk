export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'legs',
  'triceps',
  'biceps',
  'abs',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

const DEFAULT_EXERCISES: Record<MuscleGroup, string[]> = {
  chest: [
    'Incline Dumbbell Press',
    'Bench Press',
    'Machine Bench Press',
    'Machine Fly',
    'Cable Fly',
    'Cable High Fly',
    'Cable Low Fly',
    'Machine Low Fly',
    'Dips',
  ],
  back: [
    'Pull-Ups',
    'Dumbbell Row',
    'Cable Pulldown',
    'Machine Pulldown',
    'Standing Barbell Row',
    'Standing Cable Row',
    'Bent-Over Barbell Row',
    'Seated Cable Row',
    'Pullovers',
    'Good Morning',
  ],
  shoulders: [
    'Around the World',
    'Overhead Press',
    'Smith Overhead Press',
    'Alternating Overhead Press',
    'Arnold Press',
    'Lateral Raise',
    'Machine Lateral Raise',
    'Cable Lateral Raise',
    'Reverse Machine Fly',
    'Reverse Cable Fly',
    'Rear Delt Raise',
  ],
  legs: [
    'Squat',
    'Deadlift',
    'Bulgarian Split Squat',
    'Hamstring Curl',
    'Leg Extension',
    'Standing Calf Raise',
    'Seated Calf Raise',
  ],
  triceps: [
    'Triceps Pushdown',
    'Overhead Triceps Extension',
    'Skullcrusher',
    'Dumbbell Skullcrusher',
    'Close-Grip Bench Press',
  ],
  biceps: [
    'Dumbbell Curl',
    'Barbell Curl',
    'Preacher Curl',
    'Dumbbell Preacher Curl',
    'Cable Curl',
    'Lean Curl',
  ],
  abs: [
    'Cable Crunch',
    'Machine Crunch',
    'Roman Chair',
    'Russian Twist',
    'Machine Russian Twist',
    'Leg Raise',
    'Dragon Flag',
  ],
};

export const getDefaultExercises = (muscleGroup: MuscleGroup | 'all'): string[] | Record<MuscleGroup, string[]> => {
  if (muscleGroup === 'all') {
    return DEFAULT_EXERCISES;
  }

  return DEFAULT_EXERCISES[muscleGroup] ?? [];
};

export const formatMuscleGroupLabel = (value: MuscleGroup): string =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

