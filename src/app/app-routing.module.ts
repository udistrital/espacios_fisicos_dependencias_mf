import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegistroEspaciosComponent } from './pages/registro-espacios/registro-espacios.component';
import { GestionEspaciosComponent } from './pages/gestion-espacios/gestion-espacios.component';
import { HistoricoEspaciosComponent } from './pages/historico-espacios/historico-espacios.component';
import { CamposComponent } from './pages/campos/campos.component';
import { AuthGuard } from 'src/_guards/auth.guard';

const routes: Routes = [
  {
    path: "registro-espacios",
    canActivate: [AuthGuard],
    component: RegistroEspaciosComponent
  },
  {
    path: "gestion-espacios",
    canActivate: [AuthGuard],
    component: GestionEspaciosComponent
  },
  {
    path: "historico-espacios",
    canActivate: [AuthGuard],
    component: HistoricoEspaciosComponent
  },
  {
    path: "campos",
    canActivate: [AuthGuard],
    component: CamposComponent
  },
  {
    path: "**",
    redirectTo: "registro-espacios"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/"}]
})
export class AppRoutingModule { }
