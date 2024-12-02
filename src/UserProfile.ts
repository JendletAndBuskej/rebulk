class Weigh {
    weigh: number;
    timeStamp: Date;

    constructor(weigh: number, timeStamp: Date) {
        this.weigh = weigh;
        this.timeStamp = timeStamp;
    }
}

class ExerciseLog {
    weigh: number;
    reps: number;
    timeStamp: Date;

    constructor(weigh: number, reps: number, timeStamp: Date) {
        this.weigh = weigh;
        this.reps = reps;
        this.timeStamp = timeStamp;
    }
}

class Exercise {
    name: string;
    logs: ExerciseLog[];
    weighIncrement: number;
    
    constructor(name: string, logs: ExerciseLog[] = [], weighIncrement: number = 5.) {
        this.name = name;
        this.logs = logs;
        this.weighIncrement = weighIncrement;
    }
}

class Workout {
    name: string;
    exercises: Exercise[];

    constructor(name: string, exercises: Exercise[] = []) {
        this.name = name;
        this.exercises = exercises;
    }
}

class UserProfile {
    user: string;
    weigh: Weigh[];
    workouts: Workout[];
    exercises: Exercise[];

    constructor(
        user: string, 
        weigh: Weigh[] = [], 
        workouts: Workout[] = [],
        exercises: Exercise[] = [], 
    ) {
      this.user = user;
      this.weigh = weigh;
      this.workouts = workouts;
      this.exercises = exercises;
    }
  
    loadUser(userData) {
      this.user = userData.user;
      this.weigh = userData.weigh;
      this.exercises = userData.exercises;
    }
    
    addWeigh() {
  
    }
  
  }