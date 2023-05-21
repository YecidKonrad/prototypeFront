import { Activity } from "./activity";
import { StatePhase } from "./state-phase";
import { User } from "./user";

export class PhaseRequest {
  public idPhase: number;
  public phase: string;
  public startDuration: Date;
  public endDuration: Date;
  public createdDate: Date;
  public description: string;
  public ordering: number;
  public statePhase: StatePhase;
  public createdBy: User;
  public usersAsignedToPhase: User[];
  public activitiesAsingPhase: Activity[];
}
