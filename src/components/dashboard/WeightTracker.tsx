import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../../firebase';
import { WeighInDocument } from '../../types';

interface WeightTrackerProps {
  uid: string;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({ uid }) => {
  const weighInsQuery = useMemo(() => query(collection(db, 'weighIns'), where('user', '==', uid), orderBy('timestamp', 'desc')), [uid]);

  const [snapshot, loading] = useCollection(weighInsQuery);

  const weighInHistory = useMemo(() => {
    if (!snapshot) {
      return [];
    }
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as WeighInDocument),
    }));
  }, [snapshot]);

  const latestWeight = weighInHistory[0]?.weight ?? null;
  const [weightInput, setWeightInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  console.log(weighInHistory);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedWeight = parseFloat(weightInput);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setError('Please enter a weight greater than 0.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'weighIns'), {
        user: uid,
        weight: parsedWeight,
        timestamp: serverTimestamp(),
      });
      setWeightInput('');
    } catch (err) {
      console.error('Error logging weight', err);
      setError('Unable to save weight. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!loading && weighInHistory.length > 0) {
      setShowHistory(true);
    }
  }, [loading, weighInHistory.length]);

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Body Weight</h2>
      </div>
      <div className="panel__section">
        <p className="panel__subtitle">
          {latestWeight ? `Latest recorded weight: ${latestWeight} kg` : 'No weigh-ins recorded yet.'}
        </p>
        <form className="form-inline weight-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="weight-input">
            Body weight in kilograms
          </label>
          <input
            id="weight-input"
            type="number"
            min="0"
            value={weightInput}
            onChange={(event) => setWeightInput(event.target.value)}
            placeholder="e.g. 82.5"
            required
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]+"
          />
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Log weight'}
          </button>
          <button type="button" className="btn btn-tertiary" onClick={() => setShowHistory((prev) => !prev)}>
          {showHistory ? 'Hide' : 'History'}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>
      {showHistory && (
        <div className="panel__section">
          {loading ? (
            <p className="panel__empty">Loading history…</p>
          ) : weighInHistory.length === 0 ? (
            <p className="panel__empty">No weigh-ins yet. Start logging to track your progress.</p>
          ) : (
            <ul className="weight-history">
              {weighInHistory.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.weight} kg</span>
                  <span>{entry.timestamp?.toDate().toLocaleString() ?? 'Pending'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

export default WeightTracker;

