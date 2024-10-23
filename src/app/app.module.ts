import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms'
import { MatSelectModule } from '@angular/material/select';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistroEspaciosComponent } from './pages/registro-espacios/registro-espacios.component';
import { environment } from 'src/environments/environment';
import { OikosService } from './services/oikos.service';
import { OikosMidService } from './services/oikos_mid.service';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GestionEspaciosComponent } from './pages/gestion-espacios/gestion-espacios.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { EditarEspacioDialogComponent } from './pages/gestion-espacios/components/editar-espacio-dialog/editar-espacio-dialog.component';
import { HistoricoEspaciosComponent } from './pages/historico-espacios/historico-espacios.component';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl + 'assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    RegistroEspaciosComponent,
    GestionEspaciosComponent,
    EditarEspacioDialogComponent,
    HistoricoEspaciosComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    OikosService,
    OikosMidService,
    TranslateService,
    TranslateStore,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
