import fs from 'fs';

class UserProfile {
    user: string;
    weigh: Weigh[];
    // workouts: Workout[];
    exercises: Exercise[];

    // constructor(
    //     user: string, 
    //     weigh: Weigh[] = [], 
    //     workouts: Workout[] = [],
    //     exercises: Exercise[] = [], 
    // ) {
    //     this.user = user;
    //     this.weigh = weigh;
    //     // this.workouts = workouts;
    //     this.exercises = exercises;
    // }
    
    addWeigh(weigh: number) {
        const newWeigh = new Weigh(weigh, Date.now());
        this.weigh = [...this.weigh, newWeigh]
    }
}
    
class Workout {
    name: string;
    exercises: Exercise[];

    constructor(name: string, exercises: Exercise[] = []) {
        this.name = name;
        this.exercises = exercises;
    }

    addExerciseToWorkout(exercise: Exercise) {
        this.exercises = [...this.exercises, exercise]
    }

    removeExerciseFromWorkout(exerciseIndex: number) {
        if (exerciseIndex > -1)
            this.exercises.splice(exerciseIndex, 1);
    }
}

class Exercise {
    id: string;
    name: string;
    logs: ExerciseLog[];
    weightIncrement: number;
    
    constructor(
        id: string, 
        name: string, 
        logs: ExerciseLog[] = [], 
        weightIncrement: number = 5.
    ) {
        this.id = id;
        this.name = name;
        this.logs = logs;
        this.weightIncrement = weightIncrement;
    }
    
    setWeightIncrement(increment: number) {
        this.weightIncrement = Math.max(increment, 0);
    }

    addExerciseLog(weight: number, reps: number, timeStamp: number) {
        const exerciseLog = new ExerciseLog(weight,reps,timeStamp);
        this.logs = [...this.logs, exerciseLog]
    }

    removeExercisLog(logIndex: number) {
        if (logIndex > -1)
            this.logs.splice(logIndex, 1);
            // this.logs = this.logs.splice(logIndex, 1);
    }
}

class ExerciseLog {
    weight: number;
    reps: number;
    timeStamp: number;

    constructor(weight: number, reps: number, timeStamp: number) {
        this.weight = weight;
        this.reps = reps;
        this.timeStamp = timeStamp;
    }
}

class Weigh {
    weigh: number;
    timeStamp: number;
    constructor(weigh: number, timeStamp: number) {
        this.weigh = weigh;
        this.timeStamp = timeStamp;
    }
}

function createUserProfileFromJson(jsonPath: string) {
    const userAsJson = fs.readFileSync(jsonPath, 'utf-8');
    const userProfile = Object.assign(new UserProfile(),userAsJson)
    return userProfile
}
const userProfile = createUserProfileFromJson('./testUser.json')
console.log(userProfile)
userProfile.addWeigh(666)
console.log(test)