import { Component, OnInit } from '@angular/core';
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
import { StatePhase } from '../model/state-phase';
import { NgForm } from '@angular/forms';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { UserService } from '../service/user.service';
import { newArray } from '@angular/compiler/src/util';
import { PhaseRequest } from '../model/phase-request';

@Component({
  selector: 'app-phase',
  templateUrl: './phase.component.html',
  styleUrls: ['./phase.component.css']
})
export class PhaseComponent implements OnInit {
  private titleSubject = new BehaviorSubject<string>('Users');
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
  public optionsModel: number[];
  myOptions;
  myTexts: IMultiSelectTexts;
  mySettings: IMultiSelectSettings;
  phaseToCreate: PhaseRequest;

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private phaseService: PhaseService, private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getPhases(true);
    this.getPhaseStates();
    this.users = this.userService.getUsersFromLocalCache();
    console.log(JSON.stringify(this.users))
    this.loadConfigs();
    this.myOptions = this.users;
    this.myOptions.forEach(function (e) { e.id = e.idUser, e.name = e.username });
  }
  onChange() {
    console.log(this.optionsModel);
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

  /*public onAddNewPhase(phaseForm: NgForm): void {

    let usersAsingPhase = this.createUsersAsigRequest();
    let usersAsingPhaseMap = new Map<number, string>();
    // Iterar a través de las entradas del mapa y agregarlas al nuevo mapa
    for (let [key, value] of Object.entries(usersAsingPhase)) {
      usersAsingPhaseMap.set(parseInt(key), value);
    }
    console.log('size before return ' + usersAsingPhase.size);
    this.phaseToCreate = phaseForm.value;
    this.phaseToCreate.usersAsignedToPhase = usersAsingPhaseMap;
    /* const newPhase = new PhaseRequest();
     newPhase.usersAsignedToPhase = new Map(Array.from(usersAsingPhaseMap.entries()));
     console.log(JSON.stringify('new phase ' + JSON.stringify(newPhase)));
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
  }*/

  public onAddNewPhase(phaseForm: NgForm): void {
    let usersAsingPhase = this.createUsersAsigRequest();

    console.log('size before return ' + usersAsingPhase.length);

    console.log(`new phase ${JSON.stringify(usersAsingPhase)}`);
    this.phaseToCreate = phaseForm.value;
    this.phaseToCreate.usersAsignedToPhase = usersAsingPhase;
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
      checkedStyle: 'fontawesome',
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

}


