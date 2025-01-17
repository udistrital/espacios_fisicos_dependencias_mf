import { Component, OnInit, Input, AfterViewInit, ViewChild, signal } from '@angular/core'; 
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaGestion } from './../../models/busquedaGestion.models';
import { Desplegables } from 'src/app/models/desplegables.models';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { EditarEspacioDialogComponent } from './components/editar-espacio-dialog/editar-espacio-dialog.component'
import { OikosService } from 'src/app/services/oikos.service';
import { OikosMidService } from 'src/app/services/oikos_mid.service';
import { catchError, tap, map } from 'rxjs/operators';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { EditarDetalles } from 'src/app/models/editarDetalles.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestion-espacios',
  templateUrl: './gestion-espacios.component.html',
  styleUrls: ['./gestion-espacios.component.css']
})
export class GestionEspaciosComponent implements OnInit, AfterViewInit {
  @Input('normalform') normalform: any;
  mostrarTabla: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  tipo_espacio_fisico: Desplegables[] = [];
  tipo_uso: Desplegables[] = [];
  dependencias: Desplegables[] = [];
  columnasBusqueda = signal<string[]>(["NOMBRE","COD_ABREVIACIÓN","DESCRIPCIÓN","ESTADO","TIPO ESPACIO FÍSICO", "TIPO USO", "ACCIONES"]);
  elementosBusqueda: BusquedaGestion[] = []

  datos = new MatTableDataSource<BusquedaGestion>();
  gestionForm !:  FormGroup;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    public dialog: MatDialog,
    public oikosService: OikosService,
    public oikosMidService: OikosMidService,
  ){
    translate.setDefaultLang('es');
    this.cargarTiposEspacioFisico();
    this.cargarTiposUso();
    this.cargarDependencias();
  }

  ngOnInit() {
    this.iniciarFormularioConsulta();
  }

  ngAfterViewInit() {
    this.datos.paginator = this.paginator;
  }

  cargarTiposEspacioFisico(){
    this.oikosService.get('tipo_espacio_fisico?limit=-1&query=Activo:true').subscribe((res:any)=>{
      this.tipo_espacio_fisico = res.map((item:any) => ({
        id: item.Id,
        nombre: item.Nombre
      }));
    })
  }

  cargarDependencias(){
    this.oikosService.get('dependencia?limit=-1&query=Activo:true').subscribe((res:any)=>{
      this.dependencias = res.map((item:any) => ({
        id: item.Id,
        nombre: item.Nombre
      }));
    })
  }

  cargarTiposUso(){
    this.oikosService.get('tipo_uso?limit=-1&query=Activo:true').subscribe((res:any)=>{
      this.tipo_uso = res.map((item:any) => ({
        id: item.Id,
        nombre: item.Nombre
      }));
    })
  }

  iniciarFormularioConsulta(){
    this.gestionForm = new FormGroup({
      nombre: new FormControl("", {
        nonNullable: false,
        validators: [Validators.required]
      }),
      tipoEspacio: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      tipoUso: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      dependencia: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      estado: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
    });
  }

  abrirDialogDetallesEditarEspacio(tipo: string, element:BusquedaGestion){
    const datos: EditarDetalles = {} as EditarDetalles;
    datos.id = element.id;
    datos.nombre = element.nombre;
    datos.cod_abreviacion = element.cod_abreviacion;
    datos.descripcion = element.descripcion;
    datos.tipoEspacio = element.tipoEspacio;
    datos.tipoUso = element.tipoUso;
    datos.tipoEdificacion = element.tipoEdificacion;
    datos.tipoTerreno = element.tipoTerreno;
    datos.dependenciaPadre = element.dependenciaPadre;
    datos.campos = element.campos;
    datos.gestion = true;

    const dialogRef = this.dialog.open(EditarEspacioDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data:{
        tipo:tipo,
        element:datos,
        dependencias: this.dependencias,
        tipo_uso: this.tipo_uso,
        tipo_espacio_fisico: this.tipo_espacio_fisico
      }
    });

    dialogRef.afterClosed().subscribe(result =>{
      if (result?.success) {
        if (this.gestionForm.value.nombre){
          if (result.nombre != datos.nombre){
            this.gestionForm.get('nombre')?.setValue(result.nombre);
          }
        }

        if (this.gestionForm.value.tipoUso?.id){
          if (result.tipo_uso != datos.tipoUso.id){
            const tipoUsoCambiado = this.tipo_uso.find(uso => uso.id === result.tipo_uso) || null;
            this.gestionForm.get('tipoUso')?.setValue(tipoUsoCambiado);
          }
        }

        if (this.gestionForm.value.dependencia?.id){
          if (result.dependencia != datos.dependenciaPadre.id){
            const dependenciaCambio = this.dependencias.find(dependencia => dependencia.id === result.dependencia) || null;
            this.gestionForm.get('dependencia')?.setValue(dependenciaCambio);
          }
        }

        if (this.gestionForm.value.tipoEspacio?.id){
          if (result.tipo_espacio != datos.tipoEspacio.id){
            const tipoEspacioCambio = this.tipo_espacio_fisico.find(tipo_espacio => tipo_espacio.id === result.tipo_espacio) || null;
            this.gestionForm.get('tipoEspacio')?.setValue(tipoEspacioCambio);
          }
        }

        this.buscarEspacios();
      }
    })
  }

  construirBusqueda() {
    const busqueda: any = {};

    if (this.gestionForm.value.nombre) {
      busqueda.NombreEspacioFisico = this.gestionForm.value.nombre;
    }

    if (this.gestionForm.value.tipoUso?.id) {
      busqueda.TipoUsoId = this.gestionForm.value.tipoUso.id;
    }

    if (this.gestionForm.value.tipoEspacio?.id) {
      busqueda.TipoEspacioFisicoId = this.gestionForm.value.tipoEspacio.id;
    }

    if (this.gestionForm.value.dependencia?.id) {
      busqueda.DependenciaId = this.gestionForm.value.dependencia.id;
    }

    if (this.gestionForm.value.estado) {
      if ( this.gestionForm.value.estado != '...'){
        busqueda.Estado = this.gestionForm.value.estado === "ACTIVO";
      }
    }
    return busqueda;
  }

  buscarEspacios() {

    const busqueda = this.construirBusqueda();
    if (Object.keys(busqueda).length !== 0) {
      this.busqueda(busqueda).subscribe((resultadosParciales) => {
        this.procesarResultados(resultadosParciales);
      });
    } else {
      const busquedaActiva = {
        Estado: true
      };
      const busquedaInactiva = {
        Estado: false
      };
      this.busqueda(busquedaActiva).subscribe((resultadosActivos) => {
      this.busqueda(busquedaInactiva).subscribe((resultadosInactivos) => {
        const resultadosTotales = [...resultadosActivos, ...resultadosInactivos];
        this.procesarResultados(resultadosTotales);
      });
      });
    }

  }

  procesarResultados(resultados: any[]) {
    if (resultados.length > 0) {
      this.datos = new MatTableDataSource<BusquedaGestion>(resultados);
      setTimeout(() => { this.datos.paginator = this.paginator; }, 1000);
      this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.BUSQUEDA'));
      this.mostrarTabla = true;
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.DATOS'));
      this.mostrarTabla = false;
    }
  }

  busqueda(busqueda: any = {}): Observable<any[]>{
    this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.BUSQUEDA'));

    return this.oikosService.post("espacio_fisico/buscar_espacio_fisico", busqueda).pipe(
      map((res: any) => {
        if (res && res.length > 0) {
          return res.map((item: any) => ({
            id: item.EspacioFisico.Id,
            nombre: item.EspacioFisico.Nombre,
            cod_abreviacion: item.EspacioFisico.CodigoAbreviacion,
            descripcion: item.EspacioFisico.Descripcion,
            tipoEdificacion: item.EspacioFisico.TipoEdificacionId,
            tipoTerreno: item.EspacioFisico.TipoTerrenoId,
            tipoEspacio: item.EspacioFisico.TipoEspacioFisicoId ? {
              id: item.EspacioFisico.TipoEspacioFisicoId.Id,
              nombre: item.EspacioFisico.TipoEspacioFisicoId.Nombre
            }: null,
            tipoUso: (() => {
              const tipoActivo = item.TiposUso.filter((t: any) => t.Activo === true);
              if (tipoActivo.length > 0) {
                const activo = tipoActivo[0];
                return {
                  id: activo.TipoUsoId.Id,
                  nombre: activo.TipoUsoId.Nombre
                };
              } else {
                return {
                  id: null,
                  nombre: 'NO APLICA'
                };
              }
            })(),
            estado: item.EspacioFisico.Activo ? 'ACTIVA' : 'NO ACTIVA',
          }));
        } else {
          return [];
        }
      }),
      catchError((error) => {
        Swal.close();
        this.popUpManager.showErrorAlert(
          this.translate.instant('ERROR.BUSQUEDA.BUSQUEDA') + 
          (error.message || this.translate.instant('ERROR.DESCONOCIDO'))
        );
        return []
      })
    );
  }

  activarDependenciaComprobacion(element: any){
    this.popUpManager.showConfirmAlert(this.translate.instant('CONFIRMACION.ACTIVAR.PREGUNTA'),this.translate.instant('CONFIRMACION.ACTIVAR.CONFIRMAR'),this.translate.instant('CONFIRMACION.ACTIVAR.DENEGAR')).then((result) =>{
      if (result === true){
        const elemento = {
          Id: element.id
        }
        this.activarEspacio(elemento)
      }
    })
  }

  desactivarDependenciaComprobacion(element: any){
    this.popUpManager.showConfirmAlert(this.translate.instant('CONFIRMACION.DESACTIVAR.PREGUNTA'),this.translate.instant('CONFIRMACION.DESACTIVAR.CONFIRMAR'),this.translate.instant('CONFIRMACION.DESACTIVAR.DENEGAR')).then((result) =>{
      if (result === true){
        const elemento = {
          Id: element.id
        }
        this.desactivarEspacio(elemento)
      }
    })
  }

  async activarEspacio(element: any) {
    this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.ACTIVAR'));
    try {
      const response: any = await this.oikosMidService.put("ActivarEspacioFisico", element).toPromise();
      if (response) {
        Swal.close();
        this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.ACTIVAR'),
          () =>{
            const busqueda = this.construirBusqueda();
            this.busqueda(busqueda).subscribe((resultados) => {
              this.procesarResultados(resultados);
            });
          });

      } else {
        Swal.close();
        this.popUpManager.showErrorAlert(this.translate.instant('ERROR.ACTIVAR'));
      }
    } catch (error) {
      Swal.close();
      this.popUpManager.showErrorAlert(this.translate.instant('ERROR.ACTIVAR') + ":" + this.translate.instant('ERROR.DESCONOCIDO'));
    }

  }

  async desactivarEspacio(element: any) {
    this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.DESACTIVAR'));
    try {
      const response: any = await this.oikosMidService.put("DesactivarEspacioFisico", element).toPromise();
      if (response) {
        Swal.close();
        this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.DESACTIVAR'),
        () =>{
          const busqueda = this.construirBusqueda();
          this.busqueda(busqueda).subscribe((resultados) => {
            this.procesarResultados(resultados);
          });
        });
      } else {
        Swal.close();
        this.popUpManager.showErrorAlert(this.translate.instant('ERROR.DESACTIVAR'));
      }
    } catch (error) {
      Swal.close();
      this.popUpManager.showErrorAlert(this.translate.instant('ERROR.DESACTIVAR') + ":" + this.translate.instant('ERROR.DESCONOCIDO'));
    }

  }


}
