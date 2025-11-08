import React, { useMemo, useState } from 'react';
import { addDoc, collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';
import { MuscleGroup } from '../data/defaultExercises';
import {
  ExerciseOption,
  UserExercise,
  UserExerciseDocument,
} from '../types';
import MuscleGroupList from '../components/dashboard/MuscleGroupList';
import ExerciseLibrary from '../components/dashboard/ExerciseLibrary';
import ExerciseDetail from '../components/dashboard/ExerciseDetail';

interface DashboardProps {
  uid: string;
}

const Dashboard: React.FC<DashboardProps> = ({ uid }) => {
  const [activeMuscleGroup, setActiveMuscleGroup] = useState<MuscleGroup | null>(null);
  const [activeExercise, setActiveExercise] = useState<ExerciseOption | null>(null);

  const exercisesRef = useMemo(() => collection(db, 'exercises'), []);
  const exercisesQuery = useMemo(
    () => query(exercisesRef, where('user', '==', uid)),
    [exercisesRef, uid],
  );
  const [userExercisesSnapshot] = useCollection(exercisesQuery);

  const userExercises: UserExercise[] = useMemo(() => {
    if (!userExercisesSnapshot) {
      return [];
    }
    return userExercisesSnapshot.docs.map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...(snapshotDoc.data() as UserExerciseDocument),
    }));
  }, [userExercisesSnapshot]);

  const handleCreateCustomExercise = async (muscleGroup: MuscleGroup, exerciseName: string) => {
    const formattedName = exerciseName
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    if (!formattedName) {
      return;
    }
    await addDoc(collection(db, 'exercises'), {
      user: uid,
      musclegroup: muscleGroup,
      exercise: formattedName,
    });
  };

  return (
    <>
      <div className="dashboard-grid dashboard-grid--no-workout">
        <MuscleGroupList
          activeMuscleGroup={activeMuscleGroup}
          onSelect={(group) => {
            setActiveMuscleGroup(group);
            if (!group) {
              setActiveExercise(null);
            }
          }}
        />
        <ExerciseLibrary
          activeMuscleGroup={activeMuscleGroup}
          userExercises={userExercises}
          onSelectExercise={(exercise) => {
            setActiveMuscleGroup(exercise.muscleGroup);
            setActiveExercise(exercise);
          }}
          onCreateExercise={handleCreateCustomExercise}
        />
        <ExerciseDetail
          uid={uid}
          exercise={activeExercise}
          onClose={() => setActiveExercise(null)}
        />
      </div>
    </>
  );
};

export default Dashboard;

