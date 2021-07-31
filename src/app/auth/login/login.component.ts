import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import * as fromRoot from '../../app.reducer';
import { UIService } from "../../shared/ui.service";
import { AuthService } from "../auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading$!: Observable<boolean>;

  constructor(private authService: AuthService,
              private uiService: UIService,
              private store: Store<fromRoot.State>) {
  }

  ngOnInit(): void {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.loginForm = new FormGroup({
      email: new FormControl('', {
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(6)]
      })
    });
  }

  onSubmit(): void {
    this.authService.login({
      email: this.loginForm.value?.email,
      password: this.loginForm.value?.password
    });
  }

}
