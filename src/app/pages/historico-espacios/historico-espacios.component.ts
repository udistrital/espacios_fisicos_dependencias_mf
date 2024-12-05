import { Component, OnInit, Input, AfterViewInit, ViewChild, signal } from '@angular/core'; 
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaHistorico } from 'src/app/models/busquedaHistorico.models';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { OikosService } from 'src/app/services/oikos.service';
import { EditarEspacioDialogComponent } from '../gestion-espacios/components/editar-espacio-dialog/editar-espacio-dialog.component'
import { catchError, tap, map } from 'rxjs/operators';
import { EditarDetalles } from 'src/app/models/editarDetalles.models';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';
@Component({
  selector: 'app-historico-espacios',
  templateUrl: './historico-espacios.component.html',
  styleUrls: ['./historico-espacios.component.css']
})
export class HistoricoEspaciosComponent  implements OnInit, AfterViewInit {
  @Input('normalform') normalform: any;
  mostrarTabla: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  columnasBusqueda = signal<string[]>(["NOMBRE","COD_ABREVIACIÓN","TIPO ESPACIO FÍSICO", "DEPENDENCIA ASOCIADA", "OBSERVACIONES"]);
  anios = signal<number[]>([]);

  datos = new MatTableDataSource<BusquedaHistorico>();
  historicoForm !:  FormGroup;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private oikosService: OikosService,
    public dialog: MatDialog,
  ){
    translate.setDefaultLang('es');
  }

  ngOnInit() {
    this.iniciarFormularioConsulta();
    this.calcularAnios();
  }

  ngAfterViewInit() {
    this.datos.paginator = this.paginator;
  }

  calcularAnios() {
    this.oikosService
      .get('asignacion_espacio_fisico_dependencia?limit=1&sortby=EspacioFisicoId__FechaCreacion&order=asc')
      .subscribe(
        (res: any) => {
          if (res && res.length > 0) {
            const fechaCreacion: string = res[0].EspacioFisicoId.FechaCreacion;
            const anioInicial: number = new Date(fechaCreacion).getFullYear();
            const anioActual: number = new Date().getFullYear();

            const aniosCalculados: number[] = [];
            for (let anio = anioInicial; anio <= anioActual; anio++) {
              aniosCalculados.push(anio);
            }
            this.anios.set(aniosCalculados);

          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.DATOS'));
          }
        },
        (error) => {
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.DATOS'));
        }
      );
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
    this.busqueda().then((resultadosParciales) => {
      console.log("AAAAAAAAAAA")
      console.log(resultadosParciales);
      this.procesarResultados(resultadosParciales);
    });
      
  }

  procesarResultados(resultados: any[]) {
    if (resultados.length > 0) {
      this.datos = new MatTableDataSource<BusquedaHistorico>(resultados);
      setTimeout(() => { this.datos.paginator = this.paginator; }, 1000);
      this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.BUSQUEDA'));
      this.mostrarTabla = true;  
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.DATOS'));
      this.mostrarTabla = false;
    }
  }
  
  async busqueda(): Promise<any[]> {
    this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.BUSQUEDA'));
  
    const anios = this.historicoForm.value.anio; 
    let resultadosCombinados: any[] = [];
  
    for (const anio of anios) {
      const resultados = await this.buscarPorAnio(anio);
      resultadosCombinados = resultadosCombinados.concat(resultados);  
    }
  
    return resultadosCombinados;
  }

  buscarPorAnio(anio: number): Promise<any[]> {
    const url = 'asignacion_espacio_fisico_dependencia?limit=-1&query=EspacioFisicoId__FechaCreacion__startswith:'+anio;
    console.log(url)
    return this.oikosService.get(url).pipe(
      map((res: any) => {
        console.log(res)
        if (res) {
          console.log("kheeeee")
          return res.map((item: any) => ({
            id: item.EspacioFisicoId.Id || null,
            nombre: item.EspacioFisicoId.Nombre || '',
            cod_abreviacion: item.EspacioFisicoId.CodigoAbreviacion || '',
            tipoEspacio: item.EspacioFisicoId.TipoEspacioFisicoId.Nombre || '',
            dependenciaAsociada: item.DependenciaId.Nombre || '',
            descripcion: item.EspacioFisicoId.Descripcion || '',
          }));
        } else {
          return [];
        }
      }),
      catchError((error) => {
        return [];
      })
    ).toPromise();
  }

  abrirDialogDetallesEditarEspacio(tipo: string, element: BusquedaHistorico){
    const datos: EditarDetalles = {} as EditarDetalles;
    datos.id = element.id;
    datos.nombre = element.nombre;
    datos.cod_abreviacion = element.cod_abreviacion;
    datos.descripcion = element.descripcion;
    datos.tipoEspacio = {
      id: 0,
      nombre: element.tipoEspacio
    };
    datos.dependenciaPadre = {
      id: 0,
      nombre: element.dependenciaAsociada
    };
    datos.gestion = false;

    const dialogRef = this.dialog.open(EditarEspacioDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data:{
        tipo:tipo,
        element:datos,
        historico: true
      }
    });
  }

}
