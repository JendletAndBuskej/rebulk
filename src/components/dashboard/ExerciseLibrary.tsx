import React, { FormEvent, useMemo, useState } from 'react';
import { getDefaultExercises, MuscleGroup, formatMuscleGroupLabel } from '../../data/defaultExercises';
import { ExerciseOption, UserExercise } from '../../types';

interface ExerciseLibraryProps {
  activeMuscleGroup: MuscleGroup | null;
  userExercises: UserExercise[];
  onSelectExercise: (exercise: ExerciseOption) => void;
  onCreateExercise: (muscleGroup: MuscleGroup, exerciseName: string) => Promise<void>;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  activeMuscleGroup,
  userExercises,
  onSelectExercise,
  onCreateExercise,
}) => {
  const [newExerciseName, setNewExerciseName] = useState('');
  const defaultExercises = useMemo(() => {
    if (!activeMuscleGroup) {
      return [];
    }
    return (getDefaultExercises(activeMuscleGroup) as string[]).sort();
  }, [activeMuscleGroup]);

  const customExercises = useMemo(() => {
    if (!activeMuscleGroup) {
      return [];
    }
    return userExercises
      .filter((exercise) => exercise.musclegroup === activeMuscleGroup)
      .map((exercise) => exercise.exercise)
      .sort();
  }, [activeMuscleGroup, userExercises]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeMuscleGroup) {
      return;
    }
    await onCreateExercise(activeMuscleGroup, newExerciseName);
    setNewExerciseName('');
  };

  if (!activeMuscleGroup) {
    return (
      <section className="panel">
        <div className="panel__header">
          <h2>Exercise Library</h2>
        </div>
        <p className="panel__empty">Pick a muscle group to browse default and custom exercises.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>{formatMuscleGroupLabel(activeMuscleGroup)} Exercises</h2>
      </div>
      <div className="panel__section">
        <h3>Default</h3>
        <div className="chips">
          {defaultExercises.map((exercise) => (
            <button
              type="button"
              key={exercise}
              className="chip"
              onClick={() => onSelectExercise({ exerciseName: exercise, muscleGroup: activeMuscleGroup })}
            >
              {exercise}
            </button>
          ))}
        </div>
      </div>
      <div className="panel__section">
        <h3>Your Exercises</h3>
        {customExercises.length === 0 ? (
          <p className="panel__empty">Create a custom exercise for this muscle group.</p>
        ) : (
          <div className="chips">
            {customExercises.map((exercise) => (
              <button
                type="button"
                key={exercise}
                className="chip chip--accent"
                onClick={() => onSelectExercise({ exerciseName: exercise, muscleGroup: activeMuscleGroup })}
              >
                {exercise}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="panel__section">
        <h3>Add Custom Exercise</h3>
        <form className="form-inline" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="exerciseName">
            Exercise name
          </label>
          <input
            id="exerciseName"
            type="text"
            value={newExerciseName}
            onChange={(event) => setNewExerciseName(event.target.value)}
            placeholder="e.g. Cable Crunch"
            required
            className="input"
          />
          <button type="submit" className="btn btn-secondary">
            Add
          </button>
        </form>
      </div>
    </section>
  );
};

export default ExerciseLibrary;

