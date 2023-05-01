export class User {
  public userId: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;
  public institution: string;
  public lastLoginDate: Date;
  public lastLoginDateDisplay: Date;
  public joinDate: Date;
  public profileImageUrl: string;
  public active: boolean;
  public notLocked: boolean;
  public role: string;
  public authorities: [];
  public idIdentificationType: number;

  constructor() {
    this.userId = '';
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.institution = '';
    this.lastLoginDate = null;
    this.lastLoginDateDisplay = null;
    this.joinDate = null;
    this.profileImageUrl = '';
    this.active = false;
    this.notLocked = false;
    this.role = '';
    this.authorities = [];
    this.idIdentificationType = 0;
  }

}
