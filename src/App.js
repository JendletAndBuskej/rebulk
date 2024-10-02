import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBhVYLGMXcO4odTzSEYayQX2NsrK-JThtg",
  authDomain: "rebulk-e126f.firebaseapp.com",
  projectId: "rebulk-e126f",
  storageBucket: "rebulk-e126f.appspot.com",
  messagingSenderId: "491091502029",
  appId: "1:491091502029:web:4b2fad7ae760506e325a84",
  measurementId: "G-1VF0NK2BF2"
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
        <button className="mGrpSel" onClick={() => btnMuscleGroupSelection("chest")}>Chest</button>
        <button className="mGrpSel" onClick={() => btnMuscleGroupSelection("back")}>Back</button>
        </div>
        <div>
        <button className="mGrpSel" onClick={() => btnMuscleGroupSelection("shoulders")}>Shoulders</button>
        <button className="mGrpSel" onClick={() => btnMuscleGroupSelection("legs")}>Legs</button>
        </div>
        <div>
        <button className="mGrpSel" onClick={() => btnMuscleGroupSelection("triceps")}>Triceps</button>
        <button className="mGrpSel" onClick={() => btnMuscleGroupSelection("biceps")}>Biceps</button>
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
      {selectedExercise && < ExercisePage exerciseName={selectedExercise} selectedMuscleGroup={selectedMuscleGroup}/>}
    </div>
  );
}

function ExercisePage({ exerciseName, selectedMuscleGroup }) {
  const { uid } = auth.currentUser;
  const loggedSetsRef = firestore.collection('loggedSets');
  // const setQuery = loggedSetsRef.where('exercise', '==', exerciseName).limit(5);
  const setQuery = loggedSetsRef
    .where('exercise', '==', exerciseName)
    .orderBy('timestamp', 'desc')
    .limit(5); 
  const [loggedSets] = useCollectionData(setQuery, { idField: 'id' });
  const [showSets, setShowSets] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Initialize ExerciseSets with empty sets
  const [exerciseSets, setExerciseSets] = useState(new ExerciseSets(exerciseName, selectedMuscleGroup));

  // New state for bestExerciseSets
  const [bestExerciseSets, setBestExerciseSets] = useState(null);

  // Check if bestExerciseSets exists and update exerciseSets when loggedSets is available
  useEffect(() => {
    if (loggedSets && loggedSets.length > 0) {
      const bestSets = new ExerciseSets(exerciseName, selectedMuscleGroup);
      bestSets.importExerciseSets(loggedSets[0].exerciseSets);
      setExerciseSets(bestSets); // Update exerciseSets with the bestExerciseSets
      setBestExerciseSets(bestSets); // Store the best sets in the state
    }
  }, [loggedSets, exerciseName, selectedMuscleGroup]);

  const handleUpdateSet = (index, newWeight, newReps) => {
    const updatedExerciseSets = new ExerciseSets(exerciseSets.exercise, exerciseSets.muscleGroup);
    updatedExerciseSets.sets = [...exerciseSets.sets];
    updatedExerciseSets.updateSet(index, newWeight, newReps);
    setExerciseSets(updatedExerciseSets);
  };

  const logExercise = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    await loggedSetsRef.add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      exercise: exerciseName,
      selectedMuscleGroup,
      user: uid,
      exerciseSets: exerciseSets.sets,
    });
    setExerciseSets(new ExerciseSets(exerciseName, selectedMuscleGroup));
    setShowPopup(false);
  };

  return (
    <div>
      <div>
        <h2>{exerciseName}</h2>
      </div>
      <div>
        <button onClick={() => setShowPopup(true)}>Create Log</button>
        <button onClick={() => setShowSets(!showSets)}>{showSets ? 'Hide Logged Sets' : 'Show Logged Sets'}</button>
      </div>
      <div>
        {showSets && <ShowLoggedSet loggedSets={loggedSets} />}
      </div>
      {showPopup && exerciseSets && exerciseSets.sets.length > 0 && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Create Log for {exerciseName}</h2>
            <form onSubmit={logExercise}>
            {bestExerciseSets && bestExerciseSets.sets.map((set, index) => (
              <div key={index}>
                <p>Beat: {set.weight}kg for {set.reps} reps</p>
                <div className="flex-container">
                  <div className="flex-item">
                    <label htmlFor={`weight-input-${index}`}>Weight (kg):</label>
                    <input
                      type="number"
                      id={`weight-input-${index}`}
                      value={exerciseSets.sets[index].weight}
                      onChange={(e) => { 
                        handleUpdateSet(index, Number(e.target.value), exerciseSets.sets[index].reps);
                      }}
                    />
                    <button type="button" className="adjust-button" onClick={() => {
                      handleUpdateSet(index, exerciseSets.sets[index].weight + 5, exerciseSets.sets[index].reps);
                    }}>+5kg</button>
                    <button type="button" className="adjust-button" onClick={() => {
                      handleUpdateSet(index, exerciseSets.sets[index].weight - 5, exerciseSets.sets[index].reps);
                    }}>-5kg</button>
                  </div>
                  <div className="flex-item">
                    <label htmlFor={`reps-input-${index}`}>Reps:</label>
                    <input
                      type="number"
                      id={`reps-input-${index}`}
                      value={exerciseSets.sets[index].reps}
                      onChange={(e) => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight, Number(e.target.value));
                      }}
                    />
                    <button type="button" className="adjust-button" onClick={() => {
                      handleUpdateSet(index, exerciseSets.sets[index].weight, exerciseSets.sets[index].reps + 1);
                    }}>+1 rep</button>
                    <button type="button" className="adjust-button" onClick={() => {
                      handleUpdateSet(index, exerciseSets.sets[index].weight, exerciseSets.sets[index].reps - 1);
                    }}>-1 rep</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="popup-buttons">
              <button type="submit">Add Log</button>
              <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ShowLoggedSet({ loggedSets }) {
  return (
    <>
      <main>
        {loggedSets && loggedSets.map(set => <LoggedSet key={set.id} set={set} />)}
      </main>
    </>
  );
}

function LoggedSet({ set }) {
  const { exercise, reps, weight } = set;
  return (
    <div className="set-log">
      <p>{exercise} - {reps} reps - {weight} kg</p>
    </div>
  );
}

class ExerciseSets {
  constructor(exercise, selectedMuscleGroup) {
    this.exercise = exercise;
    this.selectedMuscleGroup = selectedMuscleGroup;
    this.sets = [];
  }

  addSet(weight, reps) {
    this.sets.push({ weight, reps });
  }
  removeSet(index) {
    if (index >= 0 && index < this.sets.length) {
      this.sets.splice(index, 1);
    }
  }
  updateSet(index, newWeight=this.sets[index].weight, newReps=this.sets[index].reps) {
    if (index >= 0 && index < this.sets.length) {
      this.sets[index] = { weight: newWeight, reps: newReps };
    }
    console.log("at update: ")
    console.log(this.sets)
  }
  importExerciseSets(sets) {
    this.sets = sets
  }
  getExercise() {
    return {
      exercise: this.exercise,
      selectedMuscleGroup: this.selectedMuscleGroup,
      sets: this.sets
    }
  }
}


export default App;