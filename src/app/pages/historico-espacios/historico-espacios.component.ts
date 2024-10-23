import { Component, OnInit, Input, AfterViewInit, ViewChild, signal } from '@angular/core'; 
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaHistorico } from 'src/app/models/busquedaHistorico.models';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-historico-espacios',
  templateUrl: './historico-espacios.component.html',
  styleUrls: ['./historico-espacios.component.css']
})
export class HistoricoEspaciosComponent  implements OnInit, AfterViewInit {
  @Input('normalform') normalform: any;
  mostrarTabla: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  columnasBusqueda = signal<string[]>(["NOMBRE","COD_ABREVIACIÓN","TIPO ESPACIO FÍSICO", "TIPO USO", "DEPENDENCIA ASOCIADA", "OBSERVACIONES"]);
  anios = signal<number[]>([2018,2019,2020,2021,2022,2023]);
  elementosBusqueda: BusquedaHistorico[] = [
    {
      id: 1,
      nombre: "SALON 501 TORRE 1",
      cod_abreviacion: "BREV0011",
      tipoEspacio: "Cuarto",
      tipoUso: "Salón",
      dependenciaAsociada: "VICERRECTORIA",
      observaciones: "Observacion *"
    },
    {
      id: 2,
      nombre: "LABORATORIO QUÍMICA",
      cod_abreviacion: "LABQ002",
      tipoEspacio: "Laboratorio",
      tipoUso: "Científico",
      dependenciaAsociada: "VICERRECTORIA",
      observaciones: "Observacion *"
    },
    {
      id: 3,
      nombre: "SALA DE REUNIONES CENTRAL",
      cod_abreviacion: "SR003",
      tipoEspacio: "Sala",
      tipoUso: "Reuniones",
      dependenciaAsociada: "VICERRECTORIA",
      observaciones: "Observacion *"
    },
    {
      id: 4,
      nombre: "GIMNASIO PRINCIPAL",
      cod_abreviacion: "GYM004",
      tipoEspacio: "Gimnasio",
      tipoUso: "Deportivo",
      dependenciaAsociada: "VICERRECTORIA",
      observaciones: "Observacion *"
    },
    {
      id: 5,
      nombre: "AUDITORIO TORRE 2",
      cod_abreviacion: "AUDT005",
      tipoEspacio: "Auditorio",
      tipoUso: "Conferencias",
      dependenciaAsociada: "VICERRECTORIA",
      observaciones: "Observacion *"
    },
    {
      id: 6,
      nombre: "BIBLIOTECA GENERAL",
      cod_abreviacion: "BIBG006",
      tipoEspacio: "Biblioteca",
      tipoUso: "Estudio",
      dependenciaAsociada: "VICERRECTORIA",
      observaciones: "Observacion *"
    },
    {
      id: 7,
      nombre: "CAFETERÍA NORTE",
      cod_abreviacion: "CAF007",
      tipoEspacio: "Cafetería",
      tipoUso: "Alimentación",
      dependenciaAsociada: "VICERRECTORIA",
      observaciones: "Observacion *"
    }
  ];
  

  datos = new MatTableDataSource<BusquedaHistorico>();
  historicoForm !:  FormGroup;

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
    this.historicoForm = new FormGroup({
      anio: new FormControl<number | null>(null, {
        nonNullable: false,
        validators: [Validators.required]
      })
    });
  }

  buscarEspacios() {
    this.datos = new MatTableDataSource<BusquedaHistorico>(this.elementosBusqueda);
    setTimeout(() => { this.datos.paginator = this.paginator; }, 1000);
    this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.BUSQUEDA'));
    this.mostrarTabla = true;  
    console.log(this.datos);
  }

}
