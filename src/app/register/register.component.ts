import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { User } from '../model/user';
import { NotificationType } from '../enum/notification-type.enum';
import { UserService } from '../service/user.service';
import { IdentificationType } from '../model/identification-types';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  public showLoading: boolean;
  private subscriptions: Subscription[] = [];
  lista: any[] = [1, 2];
  public identificationTypes: IdentificationType[];
  public identificationTypeSelected: IdentificationType = new IdentificationType();

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private notificationService: NotificationService, private userService: UserService) { }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }
    this.getIdentificationTypes();
  }

  public onRegister(user: User): void {
    this.showLoading = true;
    console.log(JSON.stringify(this.identificationTypeSelected));
    user.identificationType = this.identificationTypeSelected;
    console.log('user -> ' + JSON.stringify(user));
    this.subscriptions.push(
      this.authenticationService.register(user).subscribe(
        (response: User) => {
          this.showLoading = false;
          this.sendNotification(NotificationType.SUCCESS, `A new account was created for ${response.firstName}.
          Please check your email for password to log in.`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  public getIdentificationTypes(): void {
    this.userService.getIdentificationTypes().subscribe(
      (response: IdentificationType[]) => {
        this.identificationTypes = response;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
      }
    );
  }

}
