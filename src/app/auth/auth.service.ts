import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";

import { Subject } from 'rxjs';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';
import { UIService } from "../shared/ui.service";
import { TrainingService } from "../training/training.service";
import { AuthData } from "./auth-data.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authChange = new Subject<boolean>();

  private isAuthenticated = false;

  constructor(private router: Router,
              private auth: AngularFireAuth,
              private trainingService: TrainingService,
              private uiService: UIService,
              private store: Store<fromRoot.State>) {
  }

  initAuthListener() {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.isAuthenticated = true;
        this.authChange.next(true);
        this.router.navigate(['/training']);
      } else {
        this.trainingService.cancelSubscriptions();
        this.isAuthenticated = false;
        this.authChange.next(false);
        this.router.navigate(['/login']);
      }
    })
  }

  registerUser(authData: AuthData) {
    this.store.dispatch(new UI.StartLoading());
    this.auth.createUserWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.uiService.showSnackbar(error.message, 3000);
    }).finally(() => {
      this.store.dispatch(new UI.StopLoading());
    });
  }

  login(authData: AuthData) {
    this.store.dispatch(new UI.StartLoading());
    this.auth.signInWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.uiService.showSnackbar(error.message, 3000);
    }).finally(() => {
      this.store.dispatch(new UI.StopLoading());
    });
  }

  logout() {
    this.auth.signOut();
  }

  isAuth() {
    return this.isAuthenticated;
  }

}
