import React from 'react';
import { MUSCLE_GROUPS, MuscleGroup, formatMuscleGroupLabel } from '../../data/defaultExercises';

interface MuscleGroupListProps {
  activeMuscleGroup: MuscleGroup | null;
  onSelect: (group: MuscleGroup | null) => void;
}

const MuscleGroupList: React.FC<MuscleGroupListProps> = ({ activeMuscleGroup, onSelect }) => (
  <section className="panel">
    <div className="panel__header">
      <h2>Muscle Groups</h2>
    </div>
    <div className="panel__grid">
      {MUSCLE_GROUPS.map((group) => {
        const isActive = group === activeMuscleGroup;
        return (
          <button
            type="button"
            key={group}
            className={`card ${isActive ? 'card--active' : ''}`}
            onClick={() => onSelect(isActive ? null : group)}
          >
            <span>{formatMuscleGroupLabel(group)}</span>
          </button>
        );
      })}
    </div>
  </section>
);

export default MuscleGroupList;

