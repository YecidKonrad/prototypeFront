import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../service/activity.service';
import { Activity } from '../model/activity';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { Phase } from '../model/phase';
import { StatePhase } from '../model/state-phase';
import { User } from '../model/user';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { PhaseRequest } from '../model/phase-request';
import { Role } from '../enum/role.enum';
import { AuthenticationService } from '../service/authentication.service';
import { StateActivity } from '../model/state-activity';
import { NgForm } from '@angular/forms';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {
  public activities: Activity[];
  public refreshing: boolean;
  private subscriptions: Subscription[] = [];
  private titleSubject = new BehaviorSubject<string>('Activities');
  public titleAction$ = this.titleSubject.asObservable();
  public phases: Phase[];
  public activityStates: StateActivity[];
  public user: User;
  public users: User[];
  public selectedActivity: Activity;
  public editActivity = new Activity();
  public activityStateSelected: StateActivity;
  public optionsModel: number[];
  public myOptions;
  myTexts: IMultiSelectTexts;
  mySettings: IMultiSelectSettings;
  activityToCreate: Activity;
  constructor(private activityService: ActivityService, private notificationService: NotificationService,
    private authenticationService: AuthenticationService, private userService: UserService) { }

  ngOnInit(): void {
    this.getActivities(true);
    this.getActivityStates();
    this.users = this.userService.getUsersFromLocalCache();
    console.log(JSON.stringify(this.users))
    this.loadConfigs();
    this.myOptions = this.users;
    this.myOptions.forEach(function (e) { e.id = e.idUser, e.name = e.username });
  }

  public getActivities(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.activityService.getActivities().subscribe(
        (response: Activity[]) => {
          this.activities = response;
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

  public getActivityStates(): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.activityService.getActivitiesStates().subscribe(
        (response: StateActivity[]) => {
          this.activityStates = response;
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public onAddNewActivity(activityForm: NgForm): void {
    let usersAsingPhase = this.createUsersAsigRequest();

    console.log('size before return ' + usersAsingPhase.length);

    console.log(`new activity ${JSON.stringify(usersAsingPhase)}`);
    this.activityToCreate = activityForm.value;
    this.activityToCreate.usersAsignedToActivity = usersAsingPhase;
    console.log(JSON.stringify(this.activityToCreate));
    this.subscriptions.push(
      this.activityService.createActivities(this.activityToCreate, this.authenticationService.getToken()).subscribe(
        (response: Activity) => {
          this.clickButton('new-activity-close');
          activityForm.reset();
          this.sendNotification(NotificationType.SUCCESS, `# ${response.idActivity} ${response.tittle} added successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
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

  public searchActivities(searchTerm: string): void {
    const results: Activity[] = [];
    for (const activity of this.activities) {
      if (activity.idActivity.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        activity.createdBy.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        activity.createdDate.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        activity.tittle.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        activity.description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        activity.stateActivity.state.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(activity);
      }
    }
    this.activities = results;
    if (results.length === 0 || !searchTerm) {
      this.getActivities(false);
    }

  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }
  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }
  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.isManager;
  }
  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }
  public onSelectActivity(selectedActivity: Activity): void {
    this.selectedActivity = selectedActivity;
    this.clickButton('openActivityInfo');
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId).click();
  }

  public onEditActivity(editActivity: Activity): void {
    this.editActivity = editActivity;
    //FILTER THE USER ASIGNED PREVIUS
    /* this.editActivity.usersAsignedToActivity.forEach(user => {
       this.myOptions = this.users.filter(us => us.username == user.username);
     });*/
    // this.myOptions.forEach(function (e) { e.id = e.idUser, e.name = e.username });
    // this.setPosibleStates(editActivity.stateActivity);
    this.clickButton('openActivityEdit');
  }
  getDiffDays(sDate, eDate) {
    var startDate = new Date(sDate);
    var endDate = new Date(eDate);

    var Time = endDate.getTime() - startDate.getTime();
    return Math.ceil(Math.abs(Time) / (1000 * 60 * 60 * 24));
  }
  onChange() {
    console.log(this.optionsModel);
  }

  public createUsersAsigRequest(): User[] {
    let userReturn: User[] = [];
    this.optionsModel.forEach(option => {
      this.users.forEach(user => {
        console.log(JSON.stringify('user -- ' + JSON.stringify(user)));
        if (option == user.idUser) {
          userReturn.push(user);
        }
      });
    });
    return userReturn;
  }

  public saveNewActivity(): void {
    this.clickButton('new-activity-save');
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
      defaultTitle: 'Asign Users',
      allSelected: 'All selected',
    };

  }

  public setPosibleStates(stateActivity: StateActivity): void {
    this.activityStates = this.activityStates.filter(ac => { ac.idStateActivity > stateActivity.idStateActivity });
  }

  public onUpdateActivity(): void {
    // const formData = this.activityService.UpdateUserFormDate(this.editActivity);
    // console.log(JSON.stringify(formData.get))
    console.log(JSON.stringify(this.activityStateSelected))
    this.editActivity.stateActivity = this.activityStateSelected;
    this.subscriptions.push(
      this.activityService.updateActivity(this.editActivity, this.authenticationService.getToken()).subscribe(
        (response: Activity) => {
          this.clickButton('closeEditActivityModalButton');
          this.getActivities(false);
          this.sendNotification(NotificationType.SUCCESS, `${response.idActivity} ${response.tittle} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }
}
