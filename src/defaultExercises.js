const getDefaultExercises = (muscleGroup) => {
    const mGrps = ['chest', 'back', 'legs', 'abs', 'triceps', 'biceps', 'shoulders', 'all']
    if (!muscleGroup in mGrps)
        return []

    var chestExercises = [
        'Incline Dumbell Press',
        'Bench Press',
        'Bench Press Machine',
        'Machine Fly',
        'Cable Fly',
        'Cable Up Fly',
        'Cable Down Fly',
        'Machine Down Fly',
        'Dips',
    ]

    var backExercises = [
        'Pullups',
        'Dumbell Row',
        'Cable Pulldowns',
        'Machine Pulldowns',
        'Standing Bar Row',
        'Standing Row',
        'Laying Bar Row',
        'Cable Row',
        'Pullovers',
        'Goodmorning',
    ]

    var shouldersExercises = [
        'Around The World',
        'Overhead Press',
        'Smith Overhead Press',
        'Alternative Overhead Press',
        'Arnold Press',
        'Lateral Raises',
        'Machine Lateral Raises',
        'Cable Lateral Raises',
        'Rear Machine Fly',
        'Rear Cable Fly',
        'Rear Raises',
    ]

    var tricepsExercises = [
        'Triceps Pushdowns',
        'Triceps Extensions',
        'Skullcrushers',
        'Dumbell Skullcrushers',
        'Narrow Bench Press',
    ]

    var bicepsExercises = [
        'Dumbell Curls',
        'Barbell Curls',
        'Preacher Curls',
        'Dumbell Preacher Curls',
        'Cable Curls',
        'Lean Curls'
    ]

    var legsExercises = [
        'Squats',
        'Deadlift',
        'Bulgarian Split Squats',
        'Hamstring Curls',
        'Leg Extensions',
        'Calf Standing Raises',
        'Calf Sitting Raises',
    ]

    var absExercises = [
        'Cable Crunchers',
        'Machine Crunchers',
        'Brutal Bench',
        'Russian Twisters',
        'Machine Russian Twisters',
        'Leg Raises',
        'Dragonfly',
    ]

    var defaultExercises = {
        'chest' : chestExercises,
        'back' : backExercises,
        'shoulders' : shouldersExercises,
        'triceps' : tricepsExercises,
        'biceps' : bicepsExercises,
        'legs' : legsExercises,
        'abs' : absExercises
    }
    if (muscleGroup === 'all')
        return defaultExercises
    return defaultExercises[muscleGroup]
}
export default getDefaultExercises;