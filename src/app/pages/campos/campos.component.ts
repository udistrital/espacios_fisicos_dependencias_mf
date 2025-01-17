import { Component, OnInit, Input, AfterViewInit, ViewChild, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { OikosService } from 'src/app/services/oikos.service';
import { catchError, map, of } from 'rxjs';
import { BusquedaCampo } from 'src/app/models/busquedaCampo.models';
import { EditarCampoDialogComponent } from './components/editar-campo-dialog/editar-campo-dialog.component';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';
@Component({
  selector: 'app-campos',
  templateUrl: './campos.component.html',
  styleUrls: ['./campos.component.css'],
})
export class CamposComponent implements OnInit, AfterViewInit {
  @Input('normalform') normalform: any;
  mostrarTabla: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columnasBusqueda = signal<string[]>([
    'NOMBRE',
    'COD_ABREVIACIÓN',
    'DESCRIPCIÓN',
    'ESTADO',
    'ACCIONES',
  ]);

  datos = new MatTableDataSource<BusquedaCampo>();
  campoForm!: FormGroup;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private oikosService: OikosService,
    public dialog: MatDialog
  ) {
    translate.setDefaultLang('es');
  }

  ngOnInit() {
    this.iniciarFormulario();
    this.buscar();
  }

  ngAfterViewInit() {
    this.datos.paginator = this.paginator;
  }

  iniciarFormulario() {
    this.campoForm = new FormGroup({
      nombreCampo: new FormControl<string | null>("", {
        nonNullable: false,
        validators: [Validators.required],
      }),
      descripcion: new FormControl<string | null>("", {
        nonNullable: false,
        validators: [Validators.required],
      }),
      cod_abreviacion: new FormControl<string | null>("", {}),
    });
  }

  buscar() {
    this.mostrarTabla = false;
    this.datos.data = []; 

    this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.BUSQUEDA_CAMPOS'));

    this.oikosService
      .get('campo')
      .pipe(
        map((res: any) => {
          if (res) {
            return res.map((item: any) => ({
              id: item.Id || null,
              nombre: item.Nombre || '',
              cod_abreviacion: item.CodigoAbreviacion || '',
              descripcion: item.Descripcion || '',
              estado: item.Activo ? 'ACTIVA' : 'NO ACTIVA',
              fechaCreacion: item.FechaCreacion,
            }));
          } else {
            return [];
          }
        }),
        catchError((error) => {
          console.error(error);
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.FALLIDA'));
          return of([]); 
        })
      )
      .subscribe((resultados) => {
        this.procesarResultados(resultados);
      });
  }

  procesarResultados(resultados: BusquedaCampo[]) {
    if (resultados.length > 0) {
      this.datos = new MatTableDataSource<BusquedaCampo>(resultados);
      setTimeout(() => {
        this.datos.paginator = this.paginator;
      }, 1000);
      this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.BUSQUEDA'));
      this.mostrarTabla = true;
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.DATOS'));
    }
  }

  crearCampo(){
    
    const formValues = this.campoForm.value;
    const nombreCampoNuevo = formValues.nombreCampo.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const existeCampo = this.datos.data.some(campo =>
        campo.nombre.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === nombreCampoNuevo
    );

    if (existeCampo) {
        this.popUpManager.showErrorAlert(this.translate.instant('ERROR.CAMPO_DUPLICADO'));
        return;
    }
    this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.REGISTRO_CAMPO'));
    const fechaActual = new Date().toISOString(); 

    const campo = {
      Nombre: formValues.nombreCampo,
      CodigoAbreviacion: formValues.cod_abreviacion?.trim() === '' ? null : formValues.cod_abreviacion.toUpperCase(),
      Descripcion: formValues.descripcion,
      Activo: true,
      FechaCreacion: fechaActual,
      FechaModificacion: fechaActual,
    };

    this.oikosService.post('campo', campo).subscribe({
      next: (response) => {
        this.popUpManager.showSuccessAlert(
          this.translate.instant('EXITO.REGISTRAR_CAMPO'),
            () => {
                this.campoForm.reset(); 
                this.buscar(); 
            }
        );
      },
      error: (error) => {
        console.error(error);
        this.popUpManager.showErrorAlert(this.translate.instant('ERROR.REGISTRAR_CAMPO'));
      },
    });
  }

  abrirDialogEditarCampo(element: BusquedaCampo){
    const dialogRef = this.dialog.open(EditarCampoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data:element
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.campoForm.reset();
        this.buscar();
      }
    });
  }

  async activarCampo(element: BusquedaCampo){
    try {
      const result = await this.popUpManager.showConfirmAlert(
          this.translate.instant('CONFIRMACION.ACTIVAR_CAMPO.PREGUNTA'),
          this.translate.instant('CONFIRMACION.ACTIVAR_CAMPO.CONFIRMAR'),
          this.translate.instant('CONFIRMACION.ACTIVAR_CAMPO.DENEGAR')
      );
      if (result) {
        this.activarDesactivarCampo(true, element)
      }
    }catch (error) {
      console.error("Error al mostrar el confirm popup:", error);
    }
  }

  async desactivarCampo(element: BusquedaCampo){
    try {
      const result = await this.popUpManager.showConfirmAlert(
          this.translate.instant('CONFIRMACION.DESACTIVAR_CAMPO.PREGUNTA'),
          this.translate.instant('CONFIRMACION.DESACTIVAR_CAMPO.CONFIRMAR'),
          this.translate.instant('CONFIRMACION.DESACTIVAR_CAMPO.DENEGAR')
      );
      if (result) {
        this.activarDesactivarCampo(false, element)
      }
    }catch (error) {
      console.error("Error al mostrar el confirm popup:", error);
    }
  }

  async activarDesactivarCampo(estado: boolean, element: BusquedaCampo){
    let carga, exito, error : string
    if (estado){
      carga = this.translate.instant('CARGA.ACTIVAR_CAMPO');
      exito = this.translate.instant('EXITO.ACTIVAR_CAMPO');
      error = this.translate.instant('ERROR.ACTIVAR_CAMPO');
    }else{
      carga = this.translate.instant('CARGA.DESACTIVAR_CAMPO');
      exito = this.translate.instant('EXITO.DESACTIVAR_CAMPO');
      error = this.translate.instant('ERROR.DESACTIVAR_CAMPO');
    }
    this.popUpManager.showLoaderAlert(carga);
    const campoModificado = {
        Id: element.id,
        Nombre: element.nombre,
        CodigoAbreviacion: element.cod_abreviacion,
        Descripcion: element.descripcion,
        FechaModificacion: new Date().toISOString(),
        FechaCreacion: element.fechaCreacion,
        Activo: estado,
    };

    try {
        const response: any = await this.oikosService.put("campo", campoModificado).toPromise();
        
        Swal.close();
        if (response) {
            this.popUpManager.showSuccessAlert(
                exito,
                () => {
                  this.campoForm.reset(); 
                  this.buscar(); 
                }
            );
        } else {
            this.popUpManager.showErrorAlert(error);
        }
    } catch (error) {
        Swal.close(); 
        this.popUpManager.showErrorAlert(
            error +
            ": " +
            this.translate.instant('ERROR.DESCONOCIDO')
        );
    }
  }

}


