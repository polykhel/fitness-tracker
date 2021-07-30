import { Injectable } from "@angular/core";

import { Subject } from 'rxjs';
import { AuthData } from "./auth-data.model";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { TrainingService } from "../training/training.service";
import { UIService } from "../shared/ui.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authChange = new Subject<boolean>();

  private isAuthenticated = false;

  constructor(private router: Router,
              private auth: AngularFireAuth,
              private trainingService: TrainingService,
              private uiService: UIService) {
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
    this.uiService.loadingStateChanged.next(true);
    this.auth.createUserWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.uiService.showSnackbar(error.message, 3000);
    }).finally(() => {
      this.uiService.loadingStateChanged.next(false);
    });
  }

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.auth.signInWithEmailAndPassword(
      authData.email,
      authData.password
    ).catch(error => {
      this.uiService.showSnackbar(error.message, 3000);
    }).finally(() => {
      this.uiService.loadingStateChanged.next(false);
    });
  }

  logout() {
    this.auth.signOut();
  }


  isAuth() {
    return this.isAuthenticated;
  }
}
