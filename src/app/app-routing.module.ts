import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegistroEspaciosComponent } from './pages/registro-espacios/registro-espacios.component';
import { GestionEspaciosComponent } from './pages/gestion-espacios/gestion-espacios.component';
import { HistoricoEspaciosComponent } from './pages/historico-espacios/historico-espacios.component';

const routes: Routes = [
  {
    path: "registro-espacios",
    component: RegistroEspaciosComponent
  },
  {
    path: "gestion-espacios",
    component: GestionEspaciosComponent
  },
  {
    path: "historico-espacios",
    component: HistoricoEspaciosComponent
  },
  {
    path: "**",
    redirectTo: "registro-espacios"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/registro-espacios"}]
})
export class AppRoutingModule { }
