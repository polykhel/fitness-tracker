import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Store } from "@ngrx/store";
import { Subject, Subscription } from "rxjs";
import { map, take } from "rxjs/operators";
import * as UI from '../shared/ui.actions';
import { UIService } from "../shared/ui.service";
import * as Training from '../training/training.actions'
import * as fromTraining from '../training/training.reducer';
import { Exercise } from "./exercise.model";

@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise | null>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExercises: Exercise[] = [];
  private fbSubs: Subscription[] = [];

  constructor(private db: AngularFirestore,
              private uiService: UIService,
              private store: Store<fromTraining.State>) {
  }

  fetchAvailableExercises() {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(this.db
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
        })
      )
      .subscribe((exercises: Exercise[]) => {
        this.store.dispatch(new Training.SetAvailableTrainings(exercises));
        this.store.dispatch(new UI.StopLoading())
      }, () => {
        this.store.dispatch(new UI.StopLoading())
        this.uiService.showSnackbar('Fetching Exercises failed, please try again later', 3000);
      }));
  }

  startExercise(selectedId: string) {
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(exercise => {
      if (exercise) {
        this.addDataToDatabase({
          ...exercise,
          date: new Date(),
          state: 'completed'
        });
      }
      this.store.dispatch(new Training.StopTraining());
    })
  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(exercise => {
      if (exercise) {
        this.addDataToDatabase({
          ...exercise,
          duration: exercise.duration * (progress / 100),
          calories: exercise.calories * (progress / 100),
          date: new Date(),
          state: 'cancelled'
        });
      }
      this.store.dispatch(new Training.StopTraining());
    });
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.db.collection<Exercise>('finishedExercises')
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.store.dispatch(new Training.SetFinishedTrainings(exercises));
      }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection<Exercise>('finishedExercises').add(exercise);
  }
}
