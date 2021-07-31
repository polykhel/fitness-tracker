import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Store } from "@ngrx/store";
import { Observable, Subscription } from "rxjs";
import * as fromRoot from '../../app.reducer';
import { Exercise } from "../exercise.model";
import { TrainingService } from "../training.service";

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercises!: Exercise[];
  exerciseSubscription!: Subscription;
  isLoading$!: Observable<boolean>;

  constructor(private trainingService: TrainingService,
              private store: Store<fromRoot.State>) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(exercises => {
      this.exercises = exercises;
    });
    this.fetchExercises();
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value?.exercise);
  }

  ngOnDestroy() {
    if (this.exerciseSubscription) {
      this.exerciseSubscription.unsubscribe();
    }
  }
}
