import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";

import { Subject } from 'rxjs';
import { State as appState } from '../app.reducer';
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
              private store: Store<{ ui: appState }>) {
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
    this.store.dispatch({type: 'START_LOADING'});
    this.auth.createUserWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.uiService.showSnackbar(error.message, 3000);
    }).finally(() => {
      this.store.dispatch({type: 'STOP_LOADING'});
    });
  }

  login(authData: AuthData) {
    this.store.dispatch({type: 'START_LOADING'});
    this.auth.signInWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.uiService.showSnackbar(error.message, 3000);
    }).finally(() => {
      this.store.dispatch({type: 'STOP_LOADING'});
    });
  }

  logout() {
    this.auth.signOut();
  }


  isAuth() {
    return this.isAuthenticated;
  }
}
