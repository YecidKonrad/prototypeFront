import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { User } from '../model/user';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Role } from '../enum/role.enum';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { PhaseService } from '../service/phase.service';
import { Phase } from '../model/phase';
import { StatePhase } from '../model/state-phase';
import { NgForm } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { UserService } from '../service/user.service';
import { newArray } from '@angular/compiler/src/util';
import { PhaseRequest } from '../model/phase-request';
import { ActivityService } from '../service/activity.service';
import { Activity } from '../model/activity';
import { CustomHttpRespone } from '../model/custom-http-response';
import { FileUploadStatus } from '../model/file-upload.status';

@Component({
  selector: 'app-phase',
  templateUrl: './phase.component.html',
  styleUrls: ['./phase.component.css']
})
export class PhaseComponent implements OnInit {
  private titleSubject = new BehaviorSubject<string>('Phases');
  public titleAction$ = this.titleSubject.asObservable();
  public phases: Phase[];
  public phaseStates: StatePhase[];
  public user: User;
  public users: User[];
  public selectedPhase: Phase;
  public refreshing: boolean;
  private subscriptions: Subscription[] = [];
  public editPhase = new Phase();
  public phaseStateSelected: StatePhase;
  public selectedUsersToPhase: number[];
  public selectedActivitiesToPhase: number[];
  usersAviables: any[];
  activitiesAviables: any[];
  myTexts: IMultiSelectTexts;
  mySettings: IMultiSelectSettings;
  phaseToCreate: PhaseRequest;
  public activities: Activity[];
  myTexts1: IMultiSelectTexts;
  mySettings1: IMultiSelectSettings;
  public fileStatus = new FileUploadStatus();
  public profileImage: File;
  public usersAviablesForEdit: any[];

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private phaseService: PhaseService, private userService: UserService,
    private notificationService: NotificationService,
    private activityService: ActivityService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getPhases(true);
    this.getPhaseStates();
    this.users = this.userService.getUsersFromLocalCache();
    console.log(JSON.stringify(this.users))
    this.loadConfigs();
    this.usersAviables = this.users;
    this.usersAviables.forEach(function (e) { e.id = e.idUser, e.name = e.username });
    this.getActivities(true);


  }
  onChange() {
    console.log(this.selectedUsersToPhase);
  }
  onChange1() {
    console.log(this.selectedActivitiesToPhase);
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
          if (!this.isAdminOrManager) {
            this.phases = response.filter(phase => {
              return phase.usersAsignedToPhase.some(user => user.idUser === this.user.idUser);
            });
          } else {
            this.phases = response;
          }
          console.log('phases full ' + JSON.stringify(this.phases));
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

  public getPhaseStates(): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.phaseService.getPhasesStates().subscribe(
        (response: StatePhase[]) => {
          this.phaseStates = response;
          this.refreshing = false;
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
    const results: Phase[] = [];
    for (const phase of this.phases) {
      if (phase.idPhase.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        phase.phase.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        phase.createdDate.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        phase.createdBy.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        phase.createdBy.email.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        phase.endDuration.toString().indexOf(searchTerm.toLowerCase()) !== -1 ||
        phase.statePhase.state.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(phase);
      }
    }
    this.phases = results;
    if (results.length === 0 || !searchTerm) {
      this.getPhases(false);
    }

  }
  public onSelectPhase(selectedPhase: Phase): void {
    console.log('phase selected ' + JSON.stringify(selectedPhase));
    this.selectedPhase = selectedPhase;
    this.clickButton('openPhaseInfo');
  }

  public onEditPhase(editPhase: Phase): void {
    this.editPhase = editPhase;
    this.usersAviablesForEdit = this.usersAviables.filter(user => {
      return !this.editPhase.usersAsignedToPhase.some(assignedUser => assignedUser.idUser === user.idUser);
    });
    this.clickButton('openUserEdit');
  }
  private clickButton(buttonId: string): void {
    document.getElementById(buttonId).click();
  }

  public onAddNewPhase(phaseForm: NgForm): void {
    let usersAsingPhase = this.createUsersAsingRequest();
    let activitiesAsingPhase = this.createActivitieAsingRequest();


    console.log('size before return usersAsingPhase ' + usersAsingPhase.length);
    console.log('size before return  activitiesAsingPhase ' + activitiesAsingPhase.length);

    console.log(`new phase ${JSON.stringify(usersAsingPhase)}`);
    this.phaseToCreate = phaseForm.value;
    this.phaseToCreate.usersAsignedToPhase = usersAsingPhase;
    this.phaseToCreate.activitiesAsingPhase = activitiesAsingPhase;

    console.log(JSON.stringify(this.phaseToCreate));
    this.subscriptions.push(
      this.phaseService.createPhases(this.phaseToCreate, this.authenticationService.getToken()).subscribe(
        (response: Phase) => {
          this.clickButton('new-phase-close');
          phaseForm.reset();
          this.sendNotification(NotificationType.SUCCESS, `# ${response.idPhase} ${response.phase} added successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }


  public saveNewPhase(): void {
    this.clickButton('new-phase-save');
  }

  public loadConfigs(): void {
    // Settings configuration
    this.mySettings = {
      enableSearch: true,
      checkedStyle: 'checkboxes',
      buttonClasses: 'btn btn-default btn-block',
      //itemClasses: 'form-control',
      containerClasses: 'form-group',
      displayAllSelectedText: true,
      showUncheckAll: true
    };

    // Text configuration
    this.myTexts = {
      checkAll: 'Select all',
      uncheckAll: 'Unselect all',
      checked: 'item selected',
      checkedPlural: 'items selected',
      searchPlaceholder: 'Find',
      searchEmptyResult: 'Nothing found...',
      searchNoRenderText: 'Type in search box to see results...',
      defaultTitle: 'Choose multiple options...',
      allSelected: 'All selected',
    };


  }

  public createUsersAsingRequest(): User[] {
    let userReturn: User[] = [];
    this.selectedUsersToPhase.forEach(option => {
      this.users.forEach(user => {
        console.log(JSON.stringify('user -- ' + JSON.stringify(user)));
        if (option == user.idUser) {
          userReturn.push(user);
        }
      });
    });
    return userReturn;
  }

  public createActivitieAsingRequest(): Activity[] {
    let activityReturn: Activity[] = [];
    this.selectedActivitiesToPhase.forEach(option => {
      this.activities.forEach(activity => {
        console.log(JSON.stringify('activity -- ' + JSON.stringify(activity)));
        if (option == activity.idActivity) {
          activityReturn.push(activity);
        }
      });
    });
    return activityReturn;
  }

  getDiffDays(sDate, eDate) {
    var startDate = new Date(sDate);
    var endDate = new Date(eDate);

    var Time = endDate.getTime() - startDate.getTime();
    return Math.ceil(Math.abs(Time) / (1000 * 60 * 60 * 24));
  }
  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.isManager;
  }

  public getActivities(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.activityService.getActivities().subscribe(
        (response: Activity[]) => {
          this.activities = response;
          //  this.activitiesAviables = this.activities;
          this.activitiesAviables = this.activities.filter(activity => {
            return activity.stateActivity.state !== 'Finalizada';
          });
          this.activitiesAviables.forEach(e => {
            e.id = e.idActivity;
            e.name = '[' + e.idActivity + ']' + ' ' + e.tittle + ' ' + '[' + e.stateActivity.state + ']';
          });
          console.log(JSON.stringify(this.activities));
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} Activities(s) loaded successfully.`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public onUpdatePhase(): void {

    console.log(JSON.stringify(this.phaseStateSelected))
    this.editPhase.statePhase = this.phaseStateSelected;
    this.editPhase.usersAsignedToPhase = this.createUsersAsingRequest();
    this.editPhase.activitiesAsingPhase = this.createActivitieAsingRequest();
    this.subscriptions.push(
      this.phaseService.updatePhase(this.editPhase, this.authenticationService.getToken()).subscribe(
        (response: Phase) => {
          this.clickButton('closeEditPhaseModalButton');
          this.getPhases(false);
          this.sendNotification(NotificationType.SUCCESS, `${response.idPhase} ${response.phase} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }

}


