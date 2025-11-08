import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../../firebase';
import { ExerciseOption, ExerciseSet, LoggedSet } from '../../types';
import { formatMuscleGroupLabel } from '../../data/defaultExercises';

interface ExerciseDetailProps {
  uid: string;
  exercise: ExerciseOption | null;
  onClose: () => void;
}

const DEFAULT_SET_COUNT = 3;

const createDefaultSets = (count = DEFAULT_SET_COUNT): ExerciseSet[] =>
  Array.from({ length: count }, () => ({ weight: 0, reps: 0 }));

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ uid, exercise, onClose }) => {
  const logsQuery = useMemo(() => {
    if (!exercise) {
      return null;
    }
    return query(
      collection(db, 'loggedSets'),
      where('exercise', '==', exercise.exerciseName),
      orderBy('timestamp', 'desc'),
    );
  }, [exercise]);

  const [snapshot, loading] = useCollection(logsQuery);

  const logs: LoggedSet[] = useMemo(() => {
    if (!snapshot) {
      return [];
    }
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<LoggedSet, 'id'>),
    }));
  }, [snapshot]);

  const userLogs = useMemo(() => logs.filter((log) => log.user === uid), [logs, uid]);

  const latestLog = useMemo(() => userLogs[0] ?? logs[0] ?? null, [logs, userLogs]);

  const bestSets = latestLog?.exerciseSets ?? null;

  const [formSets, setFormSets] = useState<ExerciseSet[]>(createDefaultSets());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!exercise) {
      setFormSets(createDefaultSets());
      return;
    }

    if (bestSets && bestSets.length) {
      setFormSets(bestSets.map((set) => ({ weight: Number(set.weight) || 0, reps: Number(set.reps) || 0 })));
    } else {
      setFormSets(createDefaultSets());
    }
  }, [bestSets, exercise]);

  const handleUpdateSet = (index: number, key: keyof ExerciseSet, value: number) => {
    setFormSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: Math.max(value, 0) };
      return next;
    });
  };

  const handleAddSet = () => {
    setFormSets((prev) => [...prev, prev[prev.length - 1] ?? { weight: 0, reps: 0 }]);
  };

  const handleRemoveSet = () => {
    setFormSets((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const handleSubmit = async () => {
    if (!exercise) {
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'loggedSets'), {
        user: uid,
        exercise: exercise.exerciseName,
        selectedMuscleGroup: exercise.muscleGroup,
        timestamp: serverTimestamp(),
        exerciseSets: formSets,
      });
      setFormSets(createDefaultSets());
    } finally {
      setIsSaving(false);
    }
  };

  if (!exercise) {
    return (
      <section className="panel">
        <div className="panel__header">
          <h2>Exercise Detail</h2>
        </div>
        <p className="panel__empty">Select an exercise to log your sets and view history.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>{exercise.exerciseName}</h2>
          <p className="panel__subtitle">{formatMuscleGroupLabel(exercise.muscleGroup)}</p>
        </div>
        <button type="button" className="btn btn-tertiary" onClick={onClose}>
          Clear
        </button>
      </div>
      <div className="panel__section">
        <h3>New Log</h3>
        <div className="sets-grid">
          {formSets.map((set, index) => (
            <div key={index} className="sets-grid__row">
              <div className="input-group">
                <label htmlFor={`weight-${index}`}>Weight (kg)</label>
                <input
                  id={`weight-${index}`}
                  type="number"
                  min={0}
                  value={set.weight}
                  onChange={(event) => handleUpdateSet(index, 'weight', Number(event.target.value))}
                />
              </div>
              <div className="input-group">
                <label htmlFor={`reps-${index}`}>Reps</label>
                <input
                  id={`reps-${index}`}
                  type="number"
                  min={0}
                  value={set.reps}
                  onChange={(event) => handleUpdateSet(index, 'reps', Number(event.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="panel__actions">
          <button type="button" className="btn btn-secondary" onClick={handleAddSet}>
            Add Set
          </button>
          <button type="button" className="btn btn-tertiary" onClick={handleRemoveSet} disabled={formSets.length === 1}>
            Remove Set
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Log'}
          </button>
        </div>
      </div>
      <div className="panel__section">
        <h3>History</h3>
        {loading ? (
          <p className="panel__empty">Loading history…</p>
        ) : userLogs.length === 0 ? (
          <p className="panel__empty">No logs yet. Save your first session to build history.</p>
        ) : (
          <div className="history">
            {userLogs.map((log) => (
              <div key={log.id} className="history__entry">
                <h4>{log.timestamp?.toDate().toLocaleString() ?? 'Pending'}</h4>
                <ul>
                  {log.exerciseSets.map((set, index) => (
                    <li key={index}>
                      {set.weight} kg · {set.reps} reps
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExerciseDetail;

