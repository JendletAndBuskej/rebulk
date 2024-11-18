import React, { useState, useEffect } from 'react';
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
  const muscleGroups = ['chest', 'back', 'shoulders', 'legs', 'triceps', 'biceps', 'abs']

  const addWorkout = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    const formattedExerciseName = _capitalizeWords(addedWorkout);
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
        {muscleGroups.map((muscleGroup, iMG) => {
            const nextMuscleGroup = muscleGroups[iMG + 1] !== undefined ? muscleGroups[iMG + 1] : null;
            return (
              <div>
                <button className='mGrpSel' onClick={() => btnMuscleGroupSelection(muscleGroup)}>{_capitalizeWords(muscleGroup)}</button>
                {nextMuscleGroup && 
                (<button className='mGrpSel' onClick={() => btnMuscleGroupSelection(nextMuscleGroup)}>{_capitalizeWords(nextMuscleGroup)}</button>)}
              </div>
            );
          }).filter((_, index) => index % 2 === 0)
        }
        <hr className='custom-line'></hr>
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
                onClick={() => 
                  {isDeleteMode ? deleteWorkout(workoutEntries.id) : setSelectedWorkout(workoutEntries)}
                }>
                  {workoutEntries.data().workoutName}
                </button>
                {nextWorkoutEntries && (
                  <button className={`mGrpSel ${isDeleteMode ? 'delete-mode' : ''}`}  
                  onClick={() => 
                    {isDeleteMode ? deleteWorkout(nextWorkoutEntries.id) : setSelectedWorkout(nextWorkoutEntries)}
                }>
                    {nextWorkoutEntries.data().workoutName}
                  </button>
                )}
              </div>
            );
          }).filter((_, index) => index % 2 === 0)
          }
          </div>
          <div className='button-container'>
            <button className='subtile-button' onClick={() => setShowPopup(true)}>Add Workout</button>
            <button className='subtile-button' onClick={() => setIsDeleteMode(!isDeleteMode)}>Remove</button>
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
                {/* <button type='submit' onClick={() => setSelectedWorkout(new Workout(addedWorkout))}>Add Workout</button> */}
                <button type='submit' >Add Workout</button>
                <button type='button' onClick={() => {setShowPopup(false)}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
      )}
      {selectedMuscleGroup && < ExerciseSelection selectedMuscleGroup={selectedMuscleGroup} />}
      {selectedWorkout && < WorkoutPage selectedWorkout={selectedWorkout}/>}
      {(selectedMuscleGroup || selectedWorkout) && <button onClick={btnPrevPage} className='back-button'>←</button>}
    </div>
  );
}

function WorkoutPage({ selectedWorkout }) {
  const exercises = selectedWorkout.data().exercises
  const [workoutExercises, setWorkoutExercises] = useState(exercises);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [addedExercises, setAddedExercises] = useState([]);
  const btnExerciseSelection = (execise) => { setSelectedExercise(execise); };
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // used for adding exercises to the workout
  const workoutsRef = firestore.collection('workouts');
  const userExercisesRef = firestore.collection('exercises');
  const { uid } = auth.currentUser;
  const userExerciseQuery = userExercisesRef.where('user', '==', uid)
  const [userExercises] = useCollectionData(userExerciseQuery, { idField: 'id' });
  const defaultExercises = getDefaultExercises('all')

  const handleExerciseClick = (exerciseName, muscleGroup) => {
    const exercise = { exerciseName, muscleGroup };  
    if (workoutExercises.some((ex) => ex.exerciseName === exerciseName)) {
      setWorkoutExercises((prevExercises) =>
        prevExercises.filter((ex) => ex.exerciseName !== exerciseName)
      );
    } else if (addedExercises.some((ex) => ex.exerciseName === exerciseName)) {
      setAddedExercises((prevExercises) =>
        prevExercises.filter((ex) => ex.exerciseName !== exerciseName)
      );
    } else {
      setAddedExercises((prevExercises) => [...prevExercises, exercise]);
    }
  };

  const addExercisesToWorkout = async () => {
    const workoutDocRef = workoutsRef.doc(selectedWorkout.id);
    try {
      const workoutDoc = await workoutDocRef.get();
      if (!workoutDoc.exists) {
        console.error('Workout document does not exist.');
        return;
      }
      const updatedExercises = [...workoutExercises, ...addedExercises];
      await workoutDocRef.update({ exercises: updatedExercises });
      setWorkoutExercises(updatedExercises);
      setAddedExercises([]);
      setShowPopup(false);
    } catch (error) {
      console.error('Error updating workout in Firestore:', error);
    }
  };
  const removeExerciseFromWorkout = async (exerciseToRemove) => {
    const workoutDocRef = workoutsRef.doc(selectedWorkout.id);
    try {
      const workoutDoc = await workoutDocRef.get();
      if (!workoutDoc.exists) {
        console.error('Workout document does not exist.');
        return;
      }
      const currentExercises = workoutDoc.data().exercises || [];
      const updatedExercises = currentExercises.filter(
        (exercise) => exercise.exerciseName !== exerciseToRemove.exerciseName
      );
      await workoutDocRef.update({ exercises: updatedExercises });
      setWorkoutExercises(updatedExercises);
    } catch (error) {
      console.error('Error updating workout in Firestore:', error);
    }
  };

  return (
    <div>
      {!selectedExercise && (
      // <div className='container'>
      <div>
        <h2>Workout - {selectedWorkout.data().workoutName}</h2>
        {workoutExercises.map((exerciseEntry, index) => {
          return (
            <div key={index}>
              <button className={`mGrpSel ${isDeleteMode ? 'delete-mode' : ''}`}  
                  onClick={() => 
                    {isDeleteMode ? removeExerciseFromWorkout(exerciseEntry) : btnExerciseSelection(exerciseEntry)}
                  }>
                {exerciseEntry.exerciseName}
              </button>
            </div>
          )
        })}
        {showPopup && (
          <div className='popup-overlay'>
          <div className='popup-content'>
            <h2>Add Exercise to Workout</h2>
            {Object.entries(defaultExercises).map(([muscleGroup, exercises]) => (
              <div key={muscleGroup}>
                {exercises.map((exercise, index) => {
                  const isInWorkoutExercises = workoutExercises.some((ex) => ex.exerciseName === exercise);
                  const isInAddedExercises = addedExercises.some((ex) => ex.exerciseName === exercise);
                  const buttonClass = isInWorkoutExercises || isInAddedExercises ? 'eSelPopUpActive' : 'eSelPopUp';
                  return (
                    <div key={`${muscleGroup}-${index}`}>
                      <button className={`${buttonClass}`} onClick={() => handleExerciseClick(exercise, muscleGroup)}>{exercise}</button>
                    </div>
                  )
                })}
              </div>
            ))}
            {userExercises.map((userExer, index) => {
              const isInWorkoutExercises = workoutExercises.some((ex) => ex.exerciseName === userExer.exercise);
              const isInAddedExercises = addedExercises.some((ex) => ex.exerciseName === userExer.exercise);
              const buttonClass = isInWorkoutExercises || isInAddedExercises ? 'eSelPopUpActive' : 'eSelPopUp';
              return (
                <div key={`userExerWO - ${index}`}>
                  <button className={`${buttonClass}`} onClick={() => handleExerciseClick(userExer.exercise, userExer.muscleGroup)}>{userExer.exercise}</button>
                </div>
              )
            })}
            <div>
              <button type='button' onClick={addExercisesToWorkout}>Add Exercises</button>
              <button type='button' onClick={() => {setShowPopup(false); setAddedExercises([]); setWorkoutExercises(exercises)}}>Cancel</button>
            </div>
          </div>
        </div>
        )}
        <div className='button-container'>
          <button className='subtile-button' onClick={() => setShowPopup(true)}>Add Exercises to Workout</button>
          <button className='subtile-button' onClick={() => setIsDeleteMode(!isDeleteMode)}>Remove Exercise from Workout</button>
        </div>
      </div>
      )}
      {selectedExercise && (< ExercisePage exerciseName={selectedExercise.exerciseName} selectedMuscleGroup={selectedExercise.muscleGroup} />)}
    </div>
  )
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

  const _capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const addExercise = async (e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    const formattedExerciseName = _capitalizeWords(exercise);
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
  const loggedSetsRef = firestore.collection('loggedSets');
  const setQuery = loggedSetsRef
    .where('exercise', '==', exerciseName)
    .orderBy('timestamp', 'desc');
  const [loggedSets] = useCollectionData(setQuery, { idField: 'id' });
  const [showSets, setShowSets] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [exerciseSets, setExerciseSets] = useState(new ExerciseSets(exerciseName, selectedMuscleGroup));
  const [bestExerciseSets, setBestExerciseSets] = useState(null);

  useEffect(() => {
    const bestSets = new ExerciseSets(exerciseName, selectedMuscleGroup);
    if (loggedSets && loggedSets.length > 0) { bestSets.importExerciseSets(loggedSets[0].exerciseSets); }
    setExerciseSets(bestSets);
    setBestExerciseSets(bestSets);
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

  return (
    <div>
      <div>
        <h2>{exerciseName}</h2>
      </div>
      <div className='mGrpSel-container'>
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
                  {/* {set.weight == 0 ? <p>No Previous Logs</p> : <p>Beat: {set.weight}kg for {set.reps} reps</p>} */}
                  <div className='flex-container'>
                    <div className='flex-item'>
                      {/* {index === 0 && <label htmlFor={`weight-input-${index}`}>Weight (kg):</label>} */}                      
                      <div className='exerciseContainer'>
                        <input
                          type='text'
                          className='exerciseInput'
                          id={`weight-input-${index}`}
                          value={exerciseSets.sets[index].weight.toString()}
                          onChange={(e) => {
                            let inputValue = e.target.value;
                            if (/^\d*\.?\d*$/.test(inputValue)) {
                              if (inputValue.startsWith('0') && inputValue[1] !== '.' && inputValue.length > 1) {
                                inputValue = inputValue.slice(1);
                              }
                              handleUpdateSet(index, inputValue === '' ? '' : inputValue, exerciseSets.sets[index].reps);
                            }
                          }}
                          onBlur={(e) => {
                            const inputValue = e.target.value;
                            if (inputValue.endsWith('.')) {
                              handleUpdateSet(index, parseFloat(inputValue.slice(0, -1)), exerciseSets.sets[index].reps);
                            } else if (inputValue === '') {
                              handleUpdateSet(index, 0, exerciseSets.sets[index].reps);
                            } else {
                              handleUpdateSet(index, parseFloat(inputValue), exerciseSets.sets[index].reps);
                            }
                          }}
                        />
                        <span className='exerciseTextField'> {exerciseSets.sets[index].weight} kg</span>
                      </div>
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight + 5, exerciseSets.sets[index].reps);
                      }}>+5</button>
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight - 5, exerciseSets.sets[index].reps);
                      }}>-5</button>
                    </div>
                    <div className='flex-item'>
                      {/* {index === 0 && <label htmlFor={`reps-input-${index}`}>Reps:</label>} */}
                      <div className='exerciseContainer'>
                        <input
                          type='text'
                          className='exerciseInput'
                          id={`reps-input-${index}`}
                          value={exerciseSets.sets[index].reps.toString()}
                          onChange={(e) => {
                            let inputValue = e.target.value;
                            if (/^\d*$/.test(inputValue)) {
                              if (inputValue.startsWith('0') && inputValue.length > 1) {
                                inputValue = inputValue.slice(1);
                              }
                              handleUpdateSet(index, exerciseSets.sets[index].weight, inputValue === '' ? '' : parseInt(inputValue, 10));
                            }
                          }}
                          onBlur={(e) => {
                            const inputValue = e.target.value;
                            if (inputValue === '') {
                              handleUpdateSet(index, exerciseSets.sets[index].weight, 0);
                            } else {
                              handleUpdateSet(index, exerciseSets.sets[index].weight, parseInt(inputValue, 10));
                            }
                          }}
                        />
                        <span className='exerciseTextField'> {exerciseSets.sets[index].reps} reps </span>
                      </div>
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight, exerciseSets.sets[index].reps + 1);
                      }}>+1</button>
                      <button type='button' className='adjust-button' onClick={() => {
                        handleUpdateSet(index, exerciseSets.sets[index].weight, exerciseSets.sets[index].reps - 1);
                      }}>-1</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className='button-container'>
                <button type='button' className='subtile-button' onClick={handleAddSet}>Add Set</button>
                <button type='button' className='subtile-button' onClick={handleRemoveSet}>Remove Set</button>
              </div>
              {/* <div className='popup-buttons'> */}
              <div className='button-container'>
                <button type='submit' className="add-cancel-buttons add-button">Add Log</button>
                <button type='button' className="add-cancel-buttons cancel-button" onClick={() => setShowPopup(false)}>Cancel</button>
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
    <main>
      {loggedSets && loggedSets.map((logEntry, index) => (
        <div key={index}>
          {logEntry.exerciseSets.map((setsEntry, setIndex) => {
            return (
              <div key={setIndex}>
                <p>{setsEntry.weight}kg - {setsEntry.reps} reps</p>
              </div>
            );
          })}
          <hr className='custom-line'></hr>
        </div>
      ))}
    </main>
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

class Workout {
  constructor(workoutName) {
    this.workoutName = workoutName;
    this.exercises = [];
  }

  addExercise(exerciseName, muscleGroup) {
    this.exercises.push({exerciseName, muscleGroup});
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

const _capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default App;