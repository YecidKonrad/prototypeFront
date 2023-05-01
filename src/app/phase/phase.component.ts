import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { User } from '../model/user';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Role } from '../enum/role.enum';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { PhaseService } from '../service/phase.service';
import { Phase } from '../model/phase';

@Component({
  selector: 'app-phase',
  templateUrl: './phase.component.html',
  styleUrls: ['./phase.component.css']
})
export class PhaseComponent implements OnInit {
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public phases: Phase[];
  public user: User;
  public selectedPhase: Phase;
  public refreshing: boolean;
  private subscriptions: Subscription[] = [];
  public editPhase = new Phase();

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private phaseService: PhaseService, private notificationService: NotificationService) {}

ngOnInit(): void {
this.user = this.authenticationService.getUserFromLocalCache();
this.getPhases(true);
}

public changeTitle(title: string): void {
this.titleSubject.next(title);
}
public get isAdmin(): boolean {
  return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
}
private getUserRole(): string {
  return this.authenticationService.getUserFromLocalCache().role;
}

public getPhases(showNotification: boolean): void {
  this.refreshing = true;
  this.subscriptions.push(
    this.phaseService.getPhases().subscribe(
      (response: Phase[]) => {
       // this.userService.addUsersToLocalCache(response);
        this.phases = response;
        this.refreshing = false;
        if (showNotification) {
          this.sendNotification(NotificationType.SUCCESS, `${response.length} phase(s) loaded successfully.`);
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.refreshing = false;
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

public searchPhases(searchTerm: string): void {

}
public onSelectPhase(selectedPhase: Phase): void {
  this.selectedPhase = selectedPhase;
  this.clickButton('openPhaseInfo');
}

public onEditPhase(editPhase: Phase): void {
  this.editPhase = editPhase;
 // this.currentUsername = editUser.username;
  this.clickButton('openUserEdit');
}
private clickButton(buttonId: string): void {
  document.getElementById(buttonId).click();
}

}
