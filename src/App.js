import React, { useRef, useState } from 'react';
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
  const setQuery = loggedSetsRef
  .where('exercise', '==', exerciseName)
  // .orderBy('timestamp', 'desc')
  .limit(5);
  const [loggedSets] = useCollectionData(setQuery, { idField: 'id' });
  const [showSets, setShowSets] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  // const lastLoggedSet = loggedSets[0]; 
  // const lastLoggedSet = new ExerciseSets(); 
  // if (loggedSets.length > 0)
  //   {
  //     lastLoggedSet = loggedSets[0];
  //   }

  // TODO fix this ugly shit
  console.log(loggedSets)
  const [firstWeight, setFirstWeight] = useState(0);
  const [firstReps, setFirstReps] = useState(0);
  const [secondWeight, setSecondWeight] = useState(0);
  const [secondReps, setSecondReps] = useState(0);
  const [thirdWeight, setThirdWeight] = useState(0);
  const [thirdReps, setThirdReps] = useState(0);

  const changeFirstWeight = (weightChange) => setFirstWeight(firstWeight + weightChange >= 0 ? firstWeight + weightChange : 0);
  const changeFirstReps = (repChange) => setFirstReps(firstReps + repChange >= 0 ? firstReps + repChange : 0);
  const changeSecondWeight = (weightChange) => setSecondWeight(secondWeight + weightChange >= 0 ? secondWeight + weightChange : 0);
  const changeSecondReps = (repChange) => setSecondReps(secondReps + repChange >= 0 ? secondReps + repChange : 0);
  const changeThirdWeight = (weightChange) => setThirdWeight(thirdWeight + weightChange >= 0 ? thirdWeight + weightChange : 0);
  const changeThirdReps = (repChange) => setThirdReps(thirdReps + repChange >= 0 ? thirdReps + repChange : 0);

  const exerciseSets = [
    { weight: firstWeight, reps: firstReps },
    { weight: secondWeight, reps: secondReps },
    { weight: thirdWeight, reps: thirdReps }
  ];
  
  const logExercise = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    await loggedSetsRef.add({
      exercise: exerciseName,
      selectedMuscleGroup,
      user: uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      exerciseSets: exerciseSets,
    });
    setFirstWeight(0);
    setSecondWeight(0);
    setThirdWeight(0);
    setFirstWeight(0);
    setSecondWeight(0);
    setThirdWeight(0);
    setShowPopup(false);
  };

  return (
    <div>
      <div>
        <h2>{exerciseName}</h2>
      </div>
      <div>
        {loggedSets && loggedSets.length > 0 && (<p>Beat {loggedSets[0].weight}kg - {loggedSets[0].reps} reps</p>)}
      </div>
      <div>
        <button onClick={() => setShowPopup(true)}>Create Log</button>
        <button onClick={() => setShowSets(!showSets)}>{showSets ? 'Hide Logged Sets' : 'Show Logged Sets'}</button>
      </div>
      <div>
        {showSets && <ShowLoggedSet loggedSets={loggedSets} />}
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Create Log for {exerciseName}</h2>
            <form onSubmit={logExercise}>
              <div className="row">
                <p>{firstWeight}kg, for {firstReps}</p>
                <label htmlFor="weight-input">Weight (kg):</label>
                <input
                  type="number"
                  id="first-weight-input"
                  value={firstWeight}
                  onChange={(e) => setFirstWeight(Number(e.target.value))}
                />
                <button type="button" onClick={changeFirstWeight(5)}>+5kg</button>
                <button type="button" onClick={changeFirstWeight(-5)}>-5kg</button>
                
                <label htmlFor="reps-input">Reps:</label>
                <input
                  type="number"
                  id="first-reps-input"
                  value={firstReps}
                  onChange={(e) => setFirstReps(Number(e.target.value))}
                />
                <button type="button" onClick={changeFirstReps(1)}>+1</button>
                <button type="button" onClick={changeFirstReps(-1)}>-1</button>
              </div>

              <div className="row">
                <p>{secondWeight}kg, for {secondReps}</p>
                <label htmlFor="weight-input">Weight (kg):</label>
                <input
                  type="number"
                  id="second-weight-input"
                  value={secondWeight}
                  onChange={(e) => setSecondWeight(Number(e.target.value))}
                />
                <button type="button" onClick={changeSecondWeight(5)}>+5kg</button>
                <button type="button" onClick={changeSecondWeight(-5)}>-5kg</button>
                
                <label htmlFor="reps-input">Reps:</label>
                <input
                  type="number"
                  id="second-reps-input"
                  value={secondReps}
                  onChange={(e) => setSecondReps(Number(e.target.value))}
                />
                <button type="button" onClick={changeSecondReps(1)}>+1</button>
                <button type="button" onClick={changeSecondReps(-1)}>-1</button>
              </div>
              
              <div className="row">
                <p>{thirdWeight}kg, for {thirdReps}</p>
                <label htmlFor="weight-input">Weight (kg):</label>
                <input
                  type="number"
                  id="third-weight-input"
                  value={thirdWeight}
                  onChange={(e) => setThirdWeight(Number(e.target.value))}
                />
                <button type="button" onClick={changeThirdWeight(5)}>+5kg</button>
                <button type="button" onClick={changeThirdWeight(-5)}>-5kg</button>
                
                <label htmlFor="reps-input">Reps:</label>
                <input
                  type="number"
                  id="third-reps-input"
                  value={thirdReps}
                  onChange={(e) => setThirdReps(Number(e.target.value))}
                />
                <button type="button" onClick={changeThirdReps(1)}>+1</button>
                <button type="button" onClick={changeThirdReps(-1)}>-1</button>
              </div>
              {/* <input
                type="number"
                // value={reps}
                value={1}
                onChange={(e) => setReps(e.target.value)}
                placeholder="Reps"
                required
              /> */}
              {/* <input
                type="number"
                // value={weight}
                value={2}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight (kg)"
                required
              /> */}
              <div className="popup-buttons">
                <button type="submit">Add Log</button>
                <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* <div>
        <form onSubmit={logSet}>
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
          <button type="submit" disabled={!reps || !weight}>
            Add Log
          </button>
        </form>
      </div> */}
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
      {/* <span>{new Date(timestamp?.toDate()).toLocaleString()}</span> */}
    </div>
  );
}

class ExerciseSets {
  constructor(
      exercise = '', selectedMuscleGroup = '', 
      firstWeight = 0, firstReps = 0,
      secondWeight = 0, secondReps = 0,
      thirdWeight = 0, thirdReps = 0,
    ) {
    this.exercise = exercise;
    this.selectedMuscleGroup = selectedMuscleGroup;
    this.firstWeight = firstWeight;
    this.secondWeight = secondWeight;
    this.thirdWeight = thirdWeight;
    this.firstReps = firstReps;
    this.secondReps = secondReps;
    this.thirdReps = thirdReps;
  }
}


export default App;