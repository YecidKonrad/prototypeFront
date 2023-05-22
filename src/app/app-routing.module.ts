import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { AuthenticationGuard } from './guard/authentication.guard';
import { PhaseComponent } from './phase/phase.component';
import { ActivityComponent } from './activity/activity.component';
import { TaskComponent } from './task/task.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'user/management', component: UserComponent, canActivate: [AuthenticationGuard] },
  { path: 'phase/management', component: PhaseComponent, canActivate: [AuthenticationGuard] },
  { path: 'activity/management', component: ActivityComponent, canActivate: [AuthenticationGuard] },
  { path: 'task/management', component: TaskComponent, canActivate: [AuthenticationGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
