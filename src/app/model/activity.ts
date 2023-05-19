import { StateActivity } from "./state-activity";
import { User } from "./user";

export class Activity {
  public idActivity: number;
  public tittle: string;
  public description: string;
  public startDuration: Date;
  public endDuration: Date;
  public createdDate: Date;
  public priority: number;
  public stateActivity: StateActivity;
  public createdBy: User;
  public usersAsignedToActivity: User[];
}
