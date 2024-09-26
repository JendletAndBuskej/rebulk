import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: 'AIzaSyBhVYLGMXcO4odTzSEYayQX2NsrK-JThtg',
  authDomain: 'rebulk-e126f.firebaseapp.com',
  projectId: 'rebulk-e126f',
  storageBucket: 'rebulk-e126f.appspot.com',
  messagingSenderId: '491091502029',
  appId: '1:491091502029:web:4b2fad7ae760506e325a84',
  measurementId: 'G-1VF0NK2BF2'
})

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='App'>
      <section>
        {user ? <WorkoutSelection /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function WorkoutSelection() {
  // Handle for buttonclicks
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showBtnPrevPage, setShowBtnPrevPage] = useState(null);
  const btnWorkoutSelection = (button) => { setSelectedWorkout(button); };
  const btnPrevPage = (button) => { setSelectedWorkout(null); };
  
  return (
    <div>
      {/* Conditional rendering for main buttons */}
      {!selectedWorkout && (
        <div>
          <h1>Select Workout Form</h1>
          <div>
            <button onClick={() => btnWorkoutSelection("gym")}>Gym BRO</button>
          </div>
        </div>
      )}
      {/* Display Muscle group selection if gym selected*/}
      {selectedWorkout === "gym" && < MuscleGroupSelection />}
      {/* Back Button to return to the original state */}
      <button onClick={btnPrevPage} className="back-button">←</button>
    </div>
  );
}

function MuscleGroupSelection() {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const btnMuscleGroupSelection = (button) => { setSelectedMuscleGroup(button); };
  const btnPrevPage = (button) => { setSelectedMuscleGroup(null); };
  return (
    <div>
      {!selectedMuscleGroup && ( 
      <div>
        <h2>Select Muscle Group</h2>
        <div>
        <button onClick={() => btnMuscleGroupSelection("chest")}>Chest</button>
        <button onClick={() => btnMuscleGroupSelection("shoulders")}>Shoulders</button>
        </div>
        <div>
        <button onClick={() => btnMuscleGroupSelection("back")}>Back</button>
        <button onClick={() => btnMuscleGroupSelection("legs")}>Legs</button>
        </div>
        <div>
        <button onClick={() => btnMuscleGroupSelection("biceps")}>Biceps</button>
        <button onClick={() => btnMuscleGroupSelection("triceps")}>Triceps</button>
        </div>
      </div>
      )}
      {selectedMuscleGroup && < ExerciseSelection selectedMuscleGroup={selectedMuscleGroup}/>}
      <button onClick={btnPrevPage} className="back-button">←</button>
    </div>
  );
}

function ExerciseSelection({ selectedMuscleGroup }) {
  const exercisesRef = firestore.collection('exercises');
  const { uid } = auth.currentUser;
  const exerciseQuery = exercisesRef.where('musclegroup', '==', selectedMuscleGroup)
  const [exercises] = useCollectionData(exerciseQuery, { idField: 'id' });
  const [exercise, setExerciseName] = useState('');
  const [musclegroup, setMuscleGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(false);
  const btnExerciseSelection = (execise) => { setSelectedExercise(execise); };
  
  const addExercise = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    await exercisesRef.add({
      exercise,
      musclegroup,
      user: uid,
    });
    setExerciseName('');
    setMuscleGroup('');
  };
  
  return (
    <div>
      {!selectedExercise && (
        <div>
        <h2>Select an Exercise</h2>
        {/* Map over the exercises data and create a button for each */}
        {exercises && exercises.map((exerciseEntry, index) => (
          <div><button key={index} onClick={() => btnExerciseSelection(exerciseEntry.exercise)}>{exerciseEntry.exercise}</button></div>)
        )}
      </div>
      )}
      {selectedExercise && < ExercisePage exerciseName={selectedExercise}/>}
    </div>
  );
}

function ExercisePage({ exerciseName }) {
  const exercisesRef = firestore.collection('logged');
  const { uid } = auth.currentUser;
  const exerciseQuery = exercisesRef.where('musclegroup', '==', selectedMuscleGroup)
  const [exercises] = useCollectionData(exerciseQuery, { idField: 'id' });
  const [showSets, setShowSets] = useState(false);
  return (
    <div>
      <div>
      <button onClick={() => setShowSets(!showSets)}>
      {showSets ? 'Hide Logged Sets' : 'Show Logged Sets'}
      </button>
      </div>
      <div>
      {showSets && <ShowLoggedSet />}
      </div>
    </div>
  );
}

function ShowLoggedSet() {
  // const dummy = useRef();
  const loggedSetsRef = firestore.collection('loggedSets');
  const { uid } = auth.currentUser;
  const setQuery = loggedSetsRef
    // .where('user', '==', uid)
    .orderBy('timestamp', 'desc')
    .limit(5);
  const [loggedSets] = useCollectionData(setQuery, { idField: 'id' });
  const [exercise, setExerciseName] = useState('');
  const [musclegroup, setMuscleGroup] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const logSet = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    await loggedSetsRef.add({
      exercise,
      musclegroup,
      reps: Number(reps),
      weight: Number(weight),
      user: uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setExerciseName('');
    setMuscleGroup('');
    setReps('');
    setWeight('');
    // dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {loggedSets && loggedSets.map(set => <LoggedSet key={set.id} set={set} />)}
        {/* <span ref={dummy}></span> */}
      </main>

      <form onSubmit={logSet}>
        <input 
          value={exercise} 
          onChange={(e) => setExerciseName(e.target.value)} 
          placeholder='Exercise Name' 
          required 
        />
        <input 
          type="number"
          value={reps} 
          onChange={(e) => setReps(e.target.value)} 
          placeholder='Reps' 
          required 
          />
        <input 
          type="number"
          value={weight} 
          onChange={(e) => setWeight(e.target.value)} 
          placeholder='Weight (kg)' 
          required 
        />
        <button type="submit" disabled={!exercise || !reps || !weight}>
          Add Log
        </button>
      </form>
    </>
  );
}

function LoggedSet({ set }) {
  const { exercise, reps, weight, timestamp } = set;
  return (
    <div className="set-log">
      <p>{exercise} - {reps} reps - {weight} kg</p>
      {/* <span>{new Date(timestamp?.toDate()).toLocaleString()}</span> */}
    </div>
  );
}

export default App;