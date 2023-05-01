import { StatePhase } from "./state-phase";
import { User } from "./user";

export class Phase {
 public idPhase : number;
 public phase : String;
 public startDuration: Date;
 public endDuration:Date;
 public createdDate:Date;
 public description:String;
 public ordering:number;
 public statePhase:StatePhase;
 public createdBy:User;
 public usersAsignedToPhase:User[];

}
