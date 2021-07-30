import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class UIService {
  loadingStateChanged = new Subject<boolean>();

  constructor(private snackbar: MatSnackBar) {
  }

  showSnackbar(message: string, duration: number) {
    this.snackbar.open(message, undefined, {
      duration: duration
    });
  }
}
