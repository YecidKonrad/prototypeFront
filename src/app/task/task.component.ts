import { Component, OnInit } from '@angular/core';
import { Task } from '../model/task';
import { BehaviorSubject, Subscription } from 'rxjs';
import { StateTask } from '../model/state-task';
import { Phase } from '../model/phase';
import { User } from '../model/user';
import { IMultiSelectSettings, IMultiSelectTexts } from 'ngx-bootstrap-multiselect';
import { TaskService } from '../service/task.service';
import { NotificationService } from '../service/notification.service';
import { AuthenticationService } from '../service/authentication.service';
import { UserService } from '../service/user.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Role } from '../enum/role.enum';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  public tasks: Task[];
  public refreshing: boolean;
  private subscriptions: Subscription[] = [];
  private titleSubject = new BehaviorSubject<string>('Tasks');
  public titleAction$ = this.titleSubject.asObservable();
  public taskStates: StateTask[];
  public user: User;
  public users: User[];
  public selectedTask: Task;
  public editTask = new Task();
  public taskStateSelected: StateTask;
  public optionsModel: number[];
  public myOptions;
  myTexts: IMultiSelectTexts;
  mySettings: IMultiSelectSettings;
  taskToCreate: Task;

  constructor(private taskService: TaskService, private notificationService: NotificationService,
    private authenticationService: AuthenticationService, private userService: UserService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getTasks(true);
    this.getTasksStates();
    this.users = this.userService.getUsersFromLocalCache();
    console.log(JSON.stringify(this.users))
    this.loadConfigs();
    this.myOptions = this.users;
    this.myOptions.forEach(function (e) { e.id = e.idUser, e.name = e.username });
  }
  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getTasks(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.taskService.getTasks().subscribe(
        (response: Task[]) => {
          if (!this.isAdminOrManager) {
            this.tasks = response.filter(task => {
              return task.usersAsignedToTask.some(user => user.idUser === this.user.idUser);
            });
          } else {
            this.tasks = response;
          }

          console.log(JSON.stringify(this.tasks));
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${this.tasks.length} Task(s) loaded successfully.`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }


  public getTasksStates(): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.taskService.getTasksStates().subscribe(
        (response: StateTask[]) => {
          console.log(JSON.stringify(this.taskStates))
          this.taskStates = response;
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public onAddNewTask(taskForm: NgForm): void {
    let usersAsingPhase = this.createUsersAsigRequest();

    console.log('size before return ' + usersAsingPhase.length);

    console.log(`new task ${JSON.stringify(usersAsingPhase)}`);
    this.taskToCreate = taskForm.value;
    this.taskToCreate.usersAsignedToTask = usersAsingPhase;
    console.log(JSON.stringify(this.taskToCreate));
    this.subscriptions.push(
      this.taskService.createTask(this.taskToCreate, this.authenticationService.getToken()).subscribe(
        (response: Task) => {
          this.clickButton('new-task-close');
          taskForm.reset();
          this.sendNotification(NotificationType.SUCCESS, `# ${response.idTask} ${response.tittle} added successfully`);
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

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId).click();
  }

  public onEditTask(editTask: Task): void {
    this.editTask = editTask;
    //FILTER THE USER ASIGNED PREVIUS
    /* this.editActivity.usersAsignedToActivity.forEach(user => {
       this.myOptions = this.users.filter(us => us.username == user.username);
     });*/
    // this.myOptions.forEach(function (e) { e.id = e.idUser, e.name = e.username });
    // this.setPosibleStates(editActivity.stateActivity);
    this.clickButton('openTaskEdit');
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

  public saveTask(): void {
    this.clickButton('new-task-save');
  }
  public onUpdateTask(): void {
    // const formData = this.activityService.UpdateUserFormDate(this.editActivity);
    // console.log(JSON.stringify(formData.get))
    console.log(JSON.stringify(this.taskStateSelected))
    this.editTask.stateTask = this.taskStateSelected;
    this.subscriptions.push(
      this.taskService.updateTask(this.editTask, this.authenticationService.getToken()).subscribe(
        (response: Task) => {
          this.clickButton('closeEditTaskModalButton');
          this.getTasks(false);
          this.sendNotification(NotificationType.SUCCESS, `${response.idTask} ${response.tittle} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
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

  public searchTasks(searchTerm: string): void {
    const results: Task[] = [];
    for (const task of this.tasks) {
      if (task.idTask.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        task.createdBy.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        task.createdDate.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        task.tittle.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        task.description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        task.stateTask.state.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(task);
      }
    }
    this.tasks = results;
    if (results.length === 0 || !searchTerm) {
      this.getTasks(false);
    }

  }
  public onSelectTask(selectedTask: Task): void {
    this.selectedTask = selectedTask;
    this.clickButton('openTaskInfo');
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
}
