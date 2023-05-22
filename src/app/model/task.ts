import { StateTask } from "./state-task";
import { User } from "./user";

export class Task {
  public idTask: number;
  public tittle: string;
  public description: string;
  public startDuration: Date;
  public endDuration: Date;
  public createdDate: Date;
  public priority: number;
  public stateTask: StateTask;
  public createdBy: User;
  public usersAsignedToTask: User[];
}
