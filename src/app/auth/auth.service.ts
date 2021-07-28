import { Injectable } from "@angular/core";

import { Subject } from 'rxjs';
import { User } from "./user.model";
import { AuthData } from "./auth-data.model";
import { Router } from "@angular/router";

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();

  private user: User | null = null;

  constructor(private router: Router) {
  }


  registerUser(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 10000)
    }
    this.authSuccessfully();
  }

  login(authData: AuthData) {
    this.user = {
      email: authData.email,
      userId: Math.round(Math.random() * 10000)
    }
    this.authSuccessfully();
  }

  logout() {
    this.user = null;
    this.authChange.next(false);
  }

  getUser() {
    return {...this.user};
  }

  isAuth() {
    return this.user != null;
  }

  private authSuccessfully() {
    this.authChange.next(true);
    this.router.navigate(['/training']);
  }
}
