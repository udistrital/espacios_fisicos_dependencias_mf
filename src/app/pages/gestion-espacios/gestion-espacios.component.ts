import { Component, OnInit, Input, AfterViewInit, ViewChild, signal } from '@angular/core'; 
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaGestion } from './../../models/busquedaGestion.models';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { EditarEspacioDialogComponent } from './components/editar-espacio-dialog/editar-espacio-dialog.component'

@Component({
  selector: 'app-gestion-espacios',
  templateUrl: './gestion-espacios.component.html',
  styleUrls: ['./gestion-espacios.component.css']
})
export class GestionEspaciosComponent implements OnInit, AfterViewInit {
  @Input('normalform') normalform: any;
  mostrarTabla: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  columnasBusqueda = signal<string[]>(["NOMBRE","COD_ABREVIACIÓN","DESCRIPCIÓN","ESTADO","TIPO ESPACIO FÍSICO", "TIPO USO", "ACCIONES"]);
  elementosBusqueda: BusquedaGestion[] = [
    {
      id: 1,
      nombre: "SALON 501 TORRE 1",
      cod_abreviacion: "BREV0011",
      descripcion: "Espacio de salón con ocupación de 30 personas",
      estado: "ACTIVA",
      tipoEspacio: "Cuarto",
      tipoUso: "Salón",
      tipoEdificacion: "Torre",
      tipoTerreno: "Interior",
      dependenciaPadre: "VICERRECTORIA",
      campos:[
        {
          nombreCampo: "Campo 1",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 1"
        },
        {
          nombreCampo: "Campo 2",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 2"
        }
      ],
      observaciones: "Observacion *"
    },
    {
      id: 2,
      nombre: "LABORATORIO QUÍMICA",
      cod_abreviacion: "LABQ002",
      descripcion: "Laboratorio equipado para prácticas de química inorgánica",
      estado: "ACTIVA",
      tipoEspacio: "Laboratorio",
      tipoUso: "Científico",
      tipoEdificacion: "Edificio",
      tipoTerreno: "Interior",
      dependenciaPadre: "VICERRECTORIA",
      campos:[
        {
          nombreCampo: "Campo 1",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 1"
        },
        {
          nombreCampo: "Campo 2",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 2"
        }
      ],
      observaciones: "Observacion *"
    },
    {
      id: 3,
      nombre: "SALA DE REUNIONES CENTRAL",
      cod_abreviacion: "SR003",
      descripcion: "Sala para reuniones ejecutivas con proyector integrado",
      estado: "NO ACTIVA",
      tipoEspacio: "Sala",
      tipoUso: "Reuniones",
      tipoEdificacion: "Edificio",
      tipoTerreno: "Interior",
      dependenciaPadre: "VICERRECTORIA",
      campos:[
        {
          nombreCampo: "Campo 1",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 1"
        }
      ],
      observaciones: "Observacion *"
    },
    {
      id: 4,
      nombre: "GIMNASIO PRINCIPAL",
      cod_abreviacion: "GYM004",
      descripcion: "Espacio para entrenamiento físico con capacidad para 50 personas",
      estado: "ACTIVA",
      tipoEspacio: "Gimnasio",
      tipoUso: "Deportivo",
      tipoEdificacion: "Complejo Deportivo",
      tipoTerreno: "Exterior",
      dependenciaPadre: "VICERRECTORIA",
      campos:[
        {
          nombreCampo: "Campo 1",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 1"
        }
      ],
      observaciones: "Observacion *"
    },
    {
      id: 5,
      nombre: "AUDITORIO TORRE 2",
      cod_abreviacion: "AUDT005",
      descripcion: "Auditorio con sistema de sonido y capacidad para 200 personas",
      estado: "ACTIVA",
      tipoEspacio: "Auditorio",
      tipoUso: "Conferencias",
      tipoEdificacion: "Torre",
      tipoTerreno: "Interior",
      dependenciaPadre: "VICERRECTORIA",
      campos:[
        {
          nombreCampo: "Campo 1",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 1"
        }
      ],
      observaciones: "Observacion *"
    },
    {
      id: 6,
      nombre: "BIBLIOTECA GENERAL",
      cod_abreviacion: "BIBG006",
      descripcion: "Biblioteca con zonas de estudio y préstamos de libros",
      estado: "NO ACTIVA",
      tipoEspacio: "Biblioteca",
      tipoUso: "Estudio",
      tipoEdificacion: "Edificio",
      tipoTerreno: "Interior",
      dependenciaPadre: "VICERRECTORIA",
      campos:[
        {
          nombreCampo: "Campo 1",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 1"
        }
      ],
      observaciones: "Observacion *"
    },
    {
      id: 7,
      nombre: "CAFETERÍA NORTE",
      cod_abreviacion: "CAF007",
      descripcion: "Espacio de cafetería con menús diarios y áreas de descanso",
      estado: "ACTIVA",
      tipoEspacio: "Cafetería",
      tipoUso: "Alimentación",
      tipoEdificacion: "Edificio",
      tipoTerreno: "Exterior",
      dependenciaPadre: "VICERRECTORIA",
      campos:[
        {
          nombreCampo: "Campo 1",
          descripcion: "Descripcion del campo",
          codigoAbreviacion: "CAMPO 1"
        }
      ],
      observaciones: "Observacion *"
    }
  ];
  

  datos = new MatTableDataSource<BusquedaGestion>();
  gestionForm !:  FormGroup;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    public dialog: MatDialog,
  ){
    translate.setDefaultLang('es');
  }

  ngOnInit() {
    this.iniciarFormularioConsulta();
  }

  ngAfterViewInit() {
    this.datos.paginator = this.paginator;
  }

  iniciarFormularioConsulta(){
    this.gestionForm = new FormGroup({
      nombre: new FormControl("", {
        nonNullable: false,
        validators: [Validators.required]
      }),
      tipoEspacio: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      tipoUso: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      descripcion: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      estado: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
    });
  }

  buscarEspacios() {
    this.datos = new MatTableDataSource<BusquedaGestion>(this.elementosBusqueda);
    setTimeout(() => { this.datos.paginator = this.paginator; }, 1000);
    this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.BUSQUEDA'));
    this.mostrarTabla = true;  
    console.log(this.datos);
  }

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

}
