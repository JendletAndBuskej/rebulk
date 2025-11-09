import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../../firebase';
import { ExerciseOption, ExerciseSet, LoggedSet } from '../../types';
import { formatMuscleGroupLabel } from '../../data/defaultExercises';
import Modal from '../ui/Modal';

interface ExerciseDetailProps {
  uid: string;
  exercise: ExerciseOption | null;
  onBackToExercises: () => void;
  onBackToMuscleGroups?: () => void;
  onExerciseRenamed: (updatedExercise: ExerciseOption) => void;
}

const DEFAULT_SET_COUNT = 3;

const createDefaultSets = (count = DEFAULT_SET_COUNT): ExerciseSet[] =>
  Array.from({ length: count }, () => ({ weight: 0, reps: 0 }));

const titleCase = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({
  uid,
  exercise,
  onBackToExercises,
  onBackToMuscleGroups,
  onExerciseRenamed,
}) => {
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
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!userLogs.length) {
      setExpandedLogId(null);
      setIsHistoryVisible(false);
      return;
    }

    if (isHistoryVisible && !expandedLogId) {
      setExpandedLogId(userLogs[0].id);
    }
  }, [expandedLogId, isHistoryVisible, userLogs]);

  useEffect(() => {
    setIsHistoryVisible(false);
    setExpandedLogId(null);
  }, [exercise?.exerciseName]);

  useEffect(() => {
    setRenameValue(exercise?.exerciseName ?? '');
    setRenameError(null);
  }, [exercise?.exerciseName]);

  useEffect(() => {
    if (!isActionsOpen) {
      return;
    }
    const handleClickAway = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [isActionsOpen]);

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

  const handleDeleteExercise = async () => {
    if (!exercise || exercise.source !== 'custom') {
      return;
    }
    setMenuError(null);
    setIsDeleting(true);
    try {
      if (exercise.exerciseId) {
        await deleteDoc(doc(db, 'exercises', exercise.exerciseId));
      }
      if (userLogs.length) {
        await Promise.all(userLogs.map((log) => deleteDoc(doc(db, 'loggedSets', log.id))));
      }
      setIsActionsOpen(false);
      onBackToExercises();
    } catch (error) {
      console.error('Error deleting exercise', error);
      setMenuError('Unable to delete exercise. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameExercise = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!exercise || exercise.source !== 'custom') {
      return;
    }
    const formattedName = titleCase(renameValue);
    if (!formattedName) {
      setRenameError('Name is required.');
      return;
    }
    if (formattedName === exercise.exerciseName) {
      setIsRenameOpen(false);
      return;
    }

    setRenameError(null);
    setIsRenaming(true);
    try {
      if (exercise.exerciseId) {
        await updateDoc(doc(db, 'exercises', exercise.exerciseId), {
          exercise: formattedName,
        });
      }
      if (userLogs.length) {
        await Promise.all(
          userLogs.map((log) =>
            updateDoc(doc(db, 'loggedSets', log.id), {
              exercise: formattedName,
            }),
          ),
        );
      }
      const updatedExercise: ExerciseOption = {
        ...exercise,
        exerciseName: formattedName,
      };
      onExerciseRenamed(updatedExercise);
      setIsRenameOpen(false);
      setIsActionsOpen(false);
    } catch (error) {
      console.error('Error renaming exercise', error);
      setRenameError('Unable to rename exercise. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const closeRenameModal = () => {
    if (isRenaming) {
      return;
    }
    setIsRenameOpen(false);
    setRenameValue(exercise?.exerciseName ?? '');
    setRenameError(null);
  };

  if (!exercise) {
    return (
      <section className="panel">
        <div className="detail__header">
          <div className="detail__nav">
            {onBackToMuscleGroups && (
              <button type="button" className="btn-link" onClick={onBackToMuscleGroups}>
                ← Muscle groups
              </button>
            )}
          </div>
          <div className="detail__title">
            <h2>Exercise Detail</h2>
            <p className="panel__subtitle">Pick an exercise to view or log sets.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="detail__header">
        <div className="detail__nav">
          {onBackToMuscleGroups && (
            <button type="button" className="btn-link" onClick={onBackToMuscleGroups}>
              ← Muscle groups
            </button>
          )}
          <button type="button" className="btn-link" onClick={onBackToExercises}>
            ← Exercises
          </button>
        </div>
        {exercise.source === 'custom' && (
          <div className="detail__actions" ref={actionsRef}>
            <h3>{exercise.exerciseName}</h3>
            <button
              type="button"
              className="icon-button detail__actions-trigger"
              onClick={() => {
                setMenuError(null);
                setIsActionsOpen((prev) => !prev);
              }}
              aria-haspopup="true"
              aria-expanded={isActionsOpen}
            >
              ⋮
            </button>
            {isActionsOpen && (
              <div className="detail__menu" role="menu">
                {menuError && <p className="detail__menu-error">{menuError}</p>}
                <button
                  type="button"
                  className="detail__menu-item"
                  onClick={() => {
                    setIsRenameOpen(true);
                    setIsActionsOpen(false);
                  }}
                  role="menuitem"
                >
                  Rename exercise
                </button>
                <button
                  type="button"
                  className="detail__menu-item detail__menu-item--danger"
                  onClick={handleDeleteExercise}
                  disabled={isDeleting}
                  role="menuitem"
                >
                  {isDeleting ? 'Deleting…' : 'Delete exercise'}
                </button>
              </div>
            )}
          </div>
        )}
        {exercise.source != 'custom' && (
          <h3>{exercise.exerciseName}</h3>
        )}
      </div>
      <div className="panel__section">
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
        <div className="panel__header panel__header--sub">
          <button
            type="button"
            className="btn btn-tertiary"
            onClick={() => setIsHistoryVisible((prev) => !prev)}
          >
            {isHistoryVisible ? 'Hide history' : 'Show history'}
          </button>
        </div>
        {!isHistoryVisible ? (
          <div></div>
        ) : loading ? (
          <p className="panel__empty">Loading history…</p>
        ) : userLogs.length === 0 ? (
          <p className="panel__empty">No logs yet. Save your first session to build history.</p>
        ) : (
          <div className="history">
            {userLogs.map((log) => {
              const isExpanded = log.id === expandedLogId;
              return (
                <div key={log.id} className="history__entry">
                  <button
                    type="button"
                    className="history__toggle"
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  >
                    <span>{log.timestamp?.toDate().toLocaleString() ?? 'Pending'}</span>
                    <span className="history__chevron" aria-hidden>
                      {isExpanded ? '▴' : '▾'}
                    </span>
                  </button>
                  {isExpanded && (
                    <ul>
                      {log.exerciseSets.map((set, index) => (
                        <li key={index}>
                          {set.weight} kg · {set.reps} reps
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Modal title="Rename Exercise" isOpen={isRenameOpen} onClose={closeRenameModal} size="sm">
        <form className="form-vertical" onSubmit={handleRenameExercise}>
          <label htmlFor="rename-exercise">Exercise name</label>
          <input
            id="rename-exercise"
            type="text"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            disabled={isRenaming}
          />
          {renameError && <p className="form-error">{renameError}</p>}
          <div className="modal__footer">
            <button type="button" className="btn btn-tertiary" onClick={closeRenameModal} disabled={isRenaming}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isRenaming}>
              {isRenaming ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default ExerciseDetail;

