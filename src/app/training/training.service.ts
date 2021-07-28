import { Exercise } from "./exercise.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise | null>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private runningExercise?: Exercise | null = null;
  private availableExercises: Exercise[] = [];
  private finishedExercises: Exercise[] = [];

  constructor(private db: AngularFirestore) {
  }

  fetchAvailableExercises() {
    this.db
      .collection<Exercise>('availableExercises')
      .snapshotChanges()
      .pipe(
        map(docArray => {
          return docArray.map(doc => {
            const data = doc.payload.doc.data();
            return {
              id: doc.payload.doc.id,
              name: data.name,
              duration: data.duration,
              calories: data.calories
            };
          })
        }))
      .subscribe((exercises: Exercise[]) => {
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises]);
      });
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciseChanged.next(Object.assign({}, this.runningExercise));
  }

  completeExercise() {
    if (this.runningExercise) {
      this.addDataToDatabase({
        ...this.runningExercise,
        date: new Date(),
        state: 'completed'
      });
    }
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    if (this.runningExercise) {
      this.addDataToDatabase({
        ...this.runningExercise,
        duration: this.runningExercise.duration * (progress / 100),
        calories: this.runningExercise.calories * (progress / 100),
        date: new Date(),
        state: 'cancelled'
      });
    }
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return {...this.runningExercise};
  }

  fetchCompletedOrCancelledExercises() {
    return this.db.collection<Exercise>('finishedExercises')
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.finishedExercises = exercises;
        this.finishedExercisesChanged.next(exercises);
      })
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection<Exercise>('finishedExercises').add(exercise);
  }
}
