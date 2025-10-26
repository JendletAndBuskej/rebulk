import usersJson from './testUser.json'

// interfaces
export interface iUsers {
    users: iUser[]

    getUserNames(): string | undefined;
}
  
export interface iUser {
    user: string
    userName: string
    weigh: iWeigh[]
    exercises: iExercise[]
}

export interface iWeigh {
    weigh: number
    timeStamp: number
}

export interface iExercise {
    idExercise: string
    name: string
    weightIncrement: number
    logs: iLog[]
}

export interface iLog {
    idLog: string
    weight: number
    reps: number
    timeStamp: number
}

// classes
class Users {
    users: UserProfile[] 
}

class UserProfile {
    user: string;
    weigh: Weigh[];
    exercises: Exercise[];
    // workouts: Workout[];

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
    
    public addWeigh(weigh: number) {
        const newWeigh = new Weigh(weigh, Date.now());
        this.weigh = [...this.weigh, newWeigh]
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

// function createUsersProfileFromJson(jsonPath: string) {
function createUsersProfileFromJson(userAsJson: object) {
    // const userAsJson = fs.readFileSync(jsonPath, 'utf-8');
    // const userProfile = Object.assign(new UserProfile(),userAsJson)
    const userProfiles = Object.assign(new Users(),userAsJson)
    return userProfiles
}

// const userProfiles = createUsersProfileFromJson(usersJson)
// const user = userProfiles.users[0]
// console.log(userProfiles)
// console.log(user)
// console.log(user.addWeigh(666))
const users: iUsers = usersJson;
console.log(users)