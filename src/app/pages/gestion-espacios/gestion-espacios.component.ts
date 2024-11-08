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

  // buscarEspacios() {
  //   this.datos = new MatTableDataSource<BusquedaGestion>(this.elementosBusqueda);
  //   setTimeout(() => { this.datos.paginator = this.paginator; }, 1000);
  //   this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.BUSQUEDA'));
  //   this.mostrarTabla = true;  
  //   console.log(this.datos);
  // }

  abrirDialogDetallesEditarEspacio(tipo: string, element:BusquedaGestion){
    const dialogRef = this.dialog.open(EditarEspacioDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data:{
        tipo:tipo,
        element:element,
      }
    });
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
        busqueda.BusquedaEstado = {
          Estado: this.gestionForm.value.estado === "ACTIVO"
        };
      }
    }
    return busqueda;
  }

  buscarEspacios() {

    const busqueda = this.construirBusqueda();
    console.log(busqueda)
    if (Object.keys(busqueda).length !== 0) {
      this.busqueda(busqueda).then((resultadosParciales) => {
        this.procesarResultados(resultadosParciales);
      });
    } else {
      
      const busquedaActiva = {
        BusquedaEstado:{
          Estado: true
        }
      };
      const busquedaInactiva = {
        BusquedaEstado:{
          Estado: false
        }
      };
      this.busqueda(busquedaActiva).then((resultadosActivos) => {
      this.busqueda(busquedaInactiva).then((resultadosInactivos) => {
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
  
  busqueda(busqueda: any = {}): Promise<any[]>{
    this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.BUSQUEDA'));

    return this.oikosMidService.post("gestion_espacios_fisicos_mid/BuscarEspacioFisico", busqueda).pipe(
      map((res: any) => {
        if (res && res.Data) {
          return res.Data.map((item: any) => ({
            id: item.EspacioFisico.Id,
            nombre: item.EspacioFisico.Nombre,
            cod_abreviacion: item.EspacioFisico.CodigoAbreviacion,
            descripcion: item.EspacioFisico.Descripcion,
            tipoEdificacion: "",
            tipoTerreno: "",
            tipoEspacio: item.TipoEspacioFisico ? {
              id: item.TipoEspacioFisico.Id,
              nombre: item.TipoEspacioFisico.Nombre
            }: null,
            tipoUso: item.TipoUso ? {
              id: item.TipoUso.Id,
              nombre: item.TipoUso.Nombre
            }: null,
            campos: item.Campos ? item.Campos.map((campo: any) => ({
              idCampo: campo.Id,
              nombreCampo: campo.Nombre,
              descripcion: campo.Descripcion,
              codigoAbreviacion: campo.CodigoAbreviacion
            })) : [],
            dependenciaPadre: item.Dependencia ? {
              id: item.Dependencia.Id,
              nombre: item.Dependencia.Nombre
            }: null,
            estado: item.EspacioFisico.Activo ? 'ACTIVA' : 'NO ACTIVA',
          }));
        } else {
          return [];
        }
      }),
      catchError((error) => {
        Swal.close();
        this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.BUSQUEDA') + (error.message || this.translate.instant('ERROR.DESCONOCIDO')));
        return []
      })
    ).toPromise() as Promise<any[]>;
  }

}
