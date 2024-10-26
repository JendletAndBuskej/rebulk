import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { doc, deleteDoc } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useCollection } from 'react-firebase-hooks/firestore';

import getAppConfig from './firebaseConfig';
import getDefaultExercises from './defaultExercises';
const appConfig = getAppConfig();
firebase.initializeApp(appConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className='container'>
      <section>
        {/* {user ? <WorkoutSelection /> : <SignIn />} */}
        {user ? <MuscleGroupSelection /> : <SignIn />}
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
  const [history, setHistory] = useState([]);
  const btnWorkoutSelection = (button) => {
    setHistory([...history, selectedWorkout]);
    setSelectedWorkout(button);
  };
  const btnPrevPage = () => {
    if (history.length > 0) {
      const lastSelection = history.pop();
      setSelectedWorkout(lastSelection);
      setHistory(history);
    } else {
      setSelectedWorkout(null);
    }
  };

  return (
    <div>
      {!selectedWorkout && (
        <div>
          <h1>Select Workout Form</h1>
          <div>
            <button onClick={() => btnWorkoutSelection('gym')}>Gym BRO</button>
          </div>
        </div>
      )}
      {selectedWorkout === 'gym' && < MuscleGroupSelection onBack={btnPrevPage} />}
      <button onClick={btnPrevPage} className='back-button'>←</button>
    </div>
  );
}

function MuscleGroupSelection() {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const workoutsRef = firestore.collection('workouts');
  const { uid } = auth.currentUser;
  const workoutQuery = workoutsRef.where('user', '==', uid)
  const [workouts] = useCollection(workoutQuery, { idField: 'id' });
  const [selectedWorkout, setSelectedWorkout] = useState(false);
  const [addedWorkout, setAddedWorkout] = useState('');
  const btnMuscleGroupSelection = (button) => {setSelectedMuscleGroup(button);};
  const btnPrevPage = (button) => { setSelectedMuscleGroup(null); setSelectedWorkout(null);};
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const addWorkout = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    const formattedExerciseName = capitalizeWords(addedWorkout);
    await workoutsRef.add({
      user: uid,
      workoutName: formattedExerciseName,
      exercises: []
    });
    setAddedWorkout('');
    setShowPopup(false);
  };
  
  const deleteWorkout = async (workoutId) => {
    console.log(workoutId)
    if (isDeleteMode) {
      try {
        await deleteDoc(doc(firestore, 'workouts', workoutId));
      } catch (error) {
        console.error('Error deleting workout:', error);
  }}};

  return (
    <div>
      {!selectedMuscleGroup && !selectedWorkout && (
      <div>
        <h2>Select Muscle Group</h2>
        <div>
          <button className='mGrpSel' onClick={() => btnMuscleGroupSelection('chest')}>Chest</button>
          <button className='mGrpSel' onClick={() => btnMuscleGroupSelection('back')}>Back</button>
        </div>
        <div>
          <button className='mGrpSel' onClick={() => btnMuscleGroupSelection('shoulders')}>Shoulders</button>
          <button className='mGrpSel' onClick={() => btnMuscleGroupSelection('legs')}>Legs</button>
        </div>
        <div>
          <button className='mGrpSel' onClick={() => btnMuscleGroupSelection('triceps')}>Triceps</button>
          <button className='mGrpSel' onClick={() => btnMuscleGroupSelection('biceps')}>Biceps</button>
        </div>
        <div>
          <button className='mGrpSel' onClick={() => btnMuscleGroupSelection('abs')}>Le Pinguini</button>
        </div>
        <hr className="custom-line"></hr>
        {workouts && (
          <div>
          <div>
          <h2>Select Workout</h2>
          </div>
          <div>
          {workouts.docs.map((workoutEntries, index) => {
            const nextWorkoutEntries = workouts.docs[index + 1] !== undefined ? workouts.docs[index + 1] : null;
            return (
              <div key={index}>
                <button className={`mGrpSel ${isDeleteMode ? 'delete-mode' : ''}`}  
                onClick={() => {
                  if (isDeleteMode) {
                    deleteWorkout(workoutEntries.id);
                  } else {
                    setSelectedWorkout(workoutEntries.data());
                  }
                }}>
                  {workoutEntries.data().workoutName}
                </button>
                {nextWorkoutEntries && (
                  <button className={`mGrpSel ${isDeleteMode ? 'delete-mode' : ''}`}  
                  onClick={() => {
                  if (isDeleteMode) {
                    deleteWorkout(nextWorkoutEntries.id);
                  } else {
                    setSelectedWorkout(nextWorkoutEntries.data());
                  }
                }}>
                    {nextWorkoutEntries.data().workoutName}
                  </button>
                )}
              </div>
            );
          }).filter((_, index) => index % 2 === 0)
          }
          </div>
          <div>
            <button className='subtile-button' onClick={() => setShowPopup(true)}>Add Workout</button>
            <button className='subtile-button' onClick={() => setIsDeleteMode(!isDeleteMode)}>Remove Workout</button>
          </div>
        </div>
        )}
        {showPopup && (
          <div className='popup-overlay'>
          <div className='popup-content'>
            <h2>Add New Workout</h2>
            <form onSubmit={addWorkout}>
              <label htmlFor='workoutName'>Workout Name:</label>
              <input
                type='text'
                id='workouts'
                value={addedWorkout}
                onChange={(e) => setAddedWorkout(e.target.value)}
                required
                />
              <div className='popup-buttons'>
                <button type='submit'>Add Workout</button>
                <button type='button' onClick={() => {setShowPopup(false); setSelectedWorkout(new Workout(addedWorkout))}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
      )}
      {selectedMuscleGroup && < ExerciseSelection selectedMuscleGroup={selectedMuscleGroup} />}
      {selectedWorkout && < WorkoutPage selectedWorkout={{selectedWorkout}} />}
      {(selectedMuscleGroup || selectedWorkout) && <button onClick={btnPrevPage} className='back-button'>←</button>}
    </div>
  );
}

function WorkoutPage({ selectedWorkout }) {
  const execises = selectedWorkout.selectedWorkout.exercises
  console.log(execises)
  const [showPopup, setShowPopup] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const btnExerciseSelection = (execise) => { setSelectedExercise(execise); };
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  return (
    <div>
      {!selectedExercise && (
      <div>
        <h2>Workout - {selectedWorkout.selectedWorkout.workoutName}</h2>
        {execises.map((exerciseEntry, index) => {
          return (
            <div key={index}>
              <button className={`eSel ${isDeleteMode ? 'delete-mode' : ''}`}  
                  onClick={() => {
                    if (isDeleteMode) {
                      btnExerciseSelection(exerciseEntry);
                    } else {
                      btnExerciseSelection(exerciseEntry);
                    }
                  }}
                  >
                {exerciseEntry}
              </button>
            </div>
          )
        })}
        {}
        {showPopup && (
          <div className='popup-overlay'>
          <div className='popup-content'>
            <h2>Add Exercise to Workout</h2>
          </div>
        </div>
        )}
        <button className='subtile-button' onClick={() => setShowPopup(true)}>Add Exercise to Workout</button>
        <button className='subtile-button' onClick={() => setIsDeleteMode(!isDeleteMode)}>Remove Exercise from Workout</button>
      </div>
      )}
      {selectedExercise && (< ExercisePage exerciseName={selectedExercise} selectedMuscleGroup={'chest'} />)}
    </div>
  )
}

class Workout {
  constructor(workoutName) {
    this.workoutName = workoutName;
    this.exercises = [];
  }

  addExercise(execiseName) {
    this.exercises.push(execiseName);
  }
  removeExercise(index) {
    if (index >= 0 && index < this.exercises.length) {
      this.exercises.splice(index, 1);
    }
  }
  importExercises(execiseNames) {
    this.exercises = execiseNames
  }
  getExercise() {
    return {
      workoutName: this.workoutName,
      exercises: this.exercises
    }
  }
}

function ExerciseSelection({ selectedMuscleGroup }) {
  const exercisesRef = firestore.collection('exercises');
  const { uid } = auth.currentUser;
  const defaultExercises = getDefaultExercises(selectedMuscleGroup)
  const exerciseQuery = exercisesRef.where('musclegroup', '==', selectedMuscleGroup)
  const [exercises] = useCollectionData(exerciseQuery, { idField: 'id' });
  const [exercise, setExerciseName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const btnExerciseSelection = (execise) => { setSelectedExercise(execise); };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const addExercise = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    const formattedExerciseName = capitalizeWords(exercise);
    await exercisesRef.add({
      user: uid,
      musclegroup: selectedMuscleGroup,
      exercise: formattedExerciseName
    });
    setExerciseName('');
    setShowPopup(false);
  };

  return (
    <div>
      {!selectedExercise && (
        <div>
          <h2>Select an Exercise</h2>
          {/* Map over the exercises data and create a button for each */}
          {defaultExercises && defaultExercises.map((defaultExerciseEntry, index) => (
            <div key={index}>
              <button className='eSel' onClick={() => btnExerciseSelection(defaultExerciseEntry)}>
                {defaultExerciseEntry}
              </button>
            </div>
          ))}
          {exercises && exercises.filter(eEntry => eEntry.user === uid).map((exerciseEntry, index) => (
            <div key={index}>
              <button className='eSel' onClick={() => btnExerciseSelection(exerciseEntry.exercise)}>
                {exerciseEntry.exercise}
              </button>
            </div>
          ))}
          <div>
            <button className='subtile-button' onClick={() => setShowPopup(true)}>Add Exercise</button>
          </div>
        </div>
      )}
      {selectedExercise && < ExercisePage exerciseName={selectedExercise} selectedMuscleGroup={selectedMuscleGroup} />}
      {showPopup && (
        <div className='popup-overlay'>
          <div className='popup-content'>
            <h2>Add New Exercise</h2>
            <form onSubmit={addExercise}>
              <label htmlFor='exerciseName'>Exercise Name:</label>
              <input
                type='text'
                id='exerciseName'
                value={exercise}
                onChange={(e) => setExerciseName(e.target.value)}
                required
              />
              <div className='popup-buttons'>
                <button type='submit'>Add Exercise</button>
                <button type='button' onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ExercisePage({ exerciseName, selectedMuscleGroup }) {
  const { uid } = auth.currentUser;
  const loggedSetsRef = firestore.collection('loggedSets');
  const setQuery = loggedSetsRef
    .where('exercise', '==', exerciseName)
    .orderBy('timestamp', 'desc')
    .limit(5);
  const [loggedSets] = useCollectionData(setQuery, { idField: 'id' });
  const [showSets, setShowSets] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [exerciseSets, setExerciseSets] = useState(new ExerciseSets(exerciseName, selectedMuscleGroup));
  const [bestExerciseSets, setBestExerciseSets] = useState(null);

  // Check if bestExerciseSets exists and update exerciseSets when loggedSets is available
  useEffect(() => {
    // if (loggedSets && loggedSets.length > 0) {
      const bestSets = new ExerciseSets(exerciseName, selectedMuscleGroup);
      if (loggedSets && loggedSets.length > 0) { bestSets.importExerciseSets(loggedSets[0].exerciseSets); }
      setExerciseSets(bestSets);
      setBestExerciseSets(bestSets);
    // }
  }, [loggedSets, exerciseName, selectedMuscleGroup]);

  const handleUpdateSet = (index, newWeight, newReps) => {
    const updatedExerciseSets = new ExerciseSets(exerciseSets.exercise, selectedMuscleGroup);
    updatedExerciseSets.sets = [...exerciseSets.sets];
    updatedExerciseSets.updateSet(index, newWeight, newReps);
    setExerciseSets(updatedExerciseSets);
  };

  const handleAddSet = () => {
    const updatedExerciseSets = new ExerciseSets(exerciseSets.exercise, selectedMuscleGroup);
    const updatedBestExerciseSets = new ExerciseSets(bestExerciseSets.exercise, bestExerciseSets.muscleGroup);
    updatedExerciseSets.sets = [...exerciseSets.sets];
    updatedBestExerciseSets.sets = [...bestExerciseSets.sets];
    updatedExerciseSets.addSet(exerciseSets.sets[0].weight, exerciseSets.sets[0].reps);
    updatedBestExerciseSets.addSet(bestExerciseSets.sets[0].weight, bestExerciseSets.sets[0].reps);
    setExerciseSets(updatedExerciseSets);
    setBestExerciseSets(updatedBestExerciseSets);
  };

  const handleRemoveSet = () => {
    const updatedExerciseSets = new ExerciseSets(exerciseSets.exercise, selectedMuscleGroup);
    const updatedBestExerciseSets = new ExerciseSets(bestExerciseSets.exercise, bestExerciseSets.muscleGroup);
    updatedExerciseSets.sets = [...exerciseSets.sets];
    updatedBestExerciseSets.sets = [...bestExerciseSets.sets];
    updatedExerciseSets.removeSet(updatedExerciseSets.sets.length-1);
    updatedBestExerciseSets.removeSet(updatedBestExerciseSets.sets.length-1);
    setExerciseSets(updatedExerciseSets);
    setBestExerciseSets(updatedBestExerciseSets);
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

  console.log(exerciseSets)
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
        <div className='popup-overlay'>
          <div className='popup-content'>
            <h2>Create Log for {exerciseName}</h2>
            <form onSubmit={logExercise}>
              {bestExerciseSets && bestExerciseSets.sets.map((set, index) => (
                <div className='wVertPad' key={index}>
                  {set.weight == 0 ? <p>No Previous Logs</p> : <p>Beat: {set.weight}kg for {set.reps} reps</p>}
                  <div className='flex-container'>
                    <div className='flex-item'>
                      {index === 0 && <label htmlFor={`weight-input-${index}`}>Weight (kg):</label>}
                      <input
                        type='number'
                        id={`weight-input-${index}`}
                        value={exerciseSets.sets[index].weight}
                        onChange={(e) => {
                          handleUpdateSet(index, Number(e.target.value), exerciseSets.sets[index].reps);
                        }}
                        />
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight + 5, exerciseSets.sets[index].reps);
                      }}>+5kg</button>
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight - 5, exerciseSets.sets[index].reps);
                      }}>-5kg</button>
                    </div>
                    <div className='flex-item'>
                      {index === 0 && <label htmlFor={`reps-input-${index}`}>Reps:</label>}
                      <input
                        type='number'
                        id={`reps-input-${index}`}
                        value={exerciseSets.sets[index].reps}
                        onChange={(e) => {
                          handleUpdateSet(index, exerciseSets.sets[index].weight, Number(e.target.value));
                        }}
                        />
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight, exerciseSets.sets[index].reps + 1);
                      }}>+1 rep</button>
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight, exerciseSets.sets[index].reps - 1);
                      }}>-1 rep</button>
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <button type='button' className='subtile-button' onClick={handleAddSet}>Add Set</button>
                <button type='button' className='subtile-button' onClick={handleRemoveSet}>Remove Set</button>
              </div>
              <div className='popup-buttons'>
                <button type='submit'>Add Log</button>
                <button type='button' onClick={() => setShowPopup(false)}>Cancel</button>
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
        {loggedSets && loggedSets.map(set => <LoggedSet key={set.id} set={set.exerciseSets} />)}
      </main>
    </>
  );
}

function LoggedSet({ set }) {
  return (
    <div className='set-log'>
      {set.forEach(setEntry => {
        <div>
          <p>{setEntry.weight}kg - {setEntry.reps} reps</p>
        </div>
      })};
    </div>
  );
}

class ExerciseSets {
  constructor(exercise, selectedMuscleGroup) {
    this.exercise = exercise;
    this.selectedMuscleGroup = selectedMuscleGroup;
    this.sets = [
      { weight: 0, reps: 0 },
      { weight: 0, reps: 0 },
      { weight: 0, reps: 0 }
    ];
  }

  addSet(weight, reps) {
    this.sets.push({ weight, reps });
  }
  removeSet(index) {
    if (index >= 0 && index < this.sets.length) {
      this.sets.splice(index, 1);
    }
  }
  updateSet(index, newWeight = this.sets[index].weight, newReps = this.sets[index].reps) {
    if (index >= 0 && index < this.sets.length) {
      this.sets[index] = { weight: newWeight, reps: newReps };
    }
    console.log('at update: ')
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