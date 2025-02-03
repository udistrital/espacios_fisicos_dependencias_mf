import { Component, Input, OnInit } from '@angular/core';
import { PopUpManager } from '../../managers/popUpManager';
import { FormControl, FormGroup, Validators, FormArray, AbstractControl} from '@angular/forms';
import { Desplegables } from 'src/app/models/desplegables.models';
import { MatDialogRef } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Campo } from 'src/app/models/campo.models';
import { MatDialog } from '@angular/material/dialog';
import { OikosService } from 'src/app/services/oikos.service';
import { OikosMidService } from 'src/app/services/oikos_mid.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { SeleccionarCampoDialogComponent } from '../gestion-espacios/components/editar-espacio-dialog/seleccionar-campo-dialog/seleccionar-campo-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-espacios',
  templateUrl: './registro-espacios.component.html',
  styleUrls: ['./registro-espacios.component.css']
})
export class RegistroEspaciosComponent implements OnInit {

  @Input('normalform') normalform: any;

  tipo_espacio_fisico: Desplegables[] = [];
  tipo_uso: Desplegables[] = [];
  dependencia_padre: Desplegables[] = [];
  registroForm!: FormGroup;
  camposExistentes: Array<Campo> = [];

  campos: Array<Campo> = [];

  constructor(
    private popUpManager: PopUpManager,
    public dialogRef: MatDialogRef<RegistroEspaciosComponent>,
    private translate: TranslateService,
    public oikosService: OikosService,
    public dialog: MatDialog,
    public oikosMidService: OikosMidService,
    private router: Router
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.cargarTiposEspacioFisico();
    this.cargarTiposUso();
    this.cargarDependencias();
    this.cargarCamposExistentes();
  }

  ngOnInit() {
    this.iniciarFormularioConsulta();
  }

  iniciarFormularioConsulta() {
    this.registroForm = new FormGroup({
      nombre: new FormControl<string | null>("", {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\S.*$/)]
      }),
      codigo_abreviacion: new FormControl<string | null>("", {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\S.*$/)]
      }),
      dependencia_padre: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      descripcion: new FormControl<string | null>("", {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\S.*$/)],
      }),
      tipo_espacio_fisico: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tipo_uso: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tipo_edificacion: new FormControl<number | null>(null, {
        nonNullable: true,
        validators: [Validators.min(0)],
      }),
      tipo_terreno: new FormControl<number | null>(null, {
        nonNullable: true,
        validators: [Validators.min(0)],
      }),
      camposDinamicos: new FormArray([])
    });
  }

  get camposDinamicos(): FormArray {
    return this.registroForm.get('camposDinamicos') as FormArray;
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
      this.dependencia_padre = res.map((item:any) => ({
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

  construirObjetoRegistro(): any{
    const formValues = this.registroForm.value;
    const camposExistentes = this.camposDinamicos.controls.map(campo => ({
      IdCampo: campo.get('idCampo')?.value,
      Valor: campo.get('valor')?.value.toUpperCase(),
      Existente: true
    }));
    return{
      EspacioFisico:{
        Nombre: formValues.nombre.toUpperCase(),
        Descripcion: formValues.descripcion,
        CodigoAbreviacion: formValues.codigo_abreviacion.toUpperCase()
      },
      TipoEspacioFisico: formValues.tipo_espacio_fisico?.id,
      TipoUso: formValues.tipo_uso?.id,
      DependenciaPadre: formValues.dependencia_padre?.id,
      TipoEdificacion: formValues.tipo_edificacion || 0,
      TipoTerreno: formValues.tipo_terreno || 0,
      camposExistentes: camposExistentes
    }
  }

  enviarEspacioFisico(){
    this.popUpManager.showConfirmAlert(this.translate.instant('CONFIRMACION.REGISTRAR.PREGUNTA'),this.translate.instant('CONFIRMACION.REGISTRAR.CONFIRMAR'),this.translate.instant('CONFIRMACION.REGISTRAR.DENEGAR')).then((result) =>{
      if (result === true){
        const registro = this.construirObjetoRegistro();
        this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.REGISTRO'));
        this.oikosMidService.post("RegistroEspacioFisico", registro).pipe(
          tap((res: any) => {
              if (res.Success) {
                  Swal.close();
                  this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.REGISTRAR'),
                  () =>  this.router.navigate(["gestion-espacios"], { queryParams: { nombre:  this.registroForm.value.nombre.toUpperCase()} }));
              } else {
                  Swal.close();
                  this.popUpManager.showErrorAlert(this.translate.instant('ERROR.REGISTRAR'));
              }
          }),
          catchError((error) => {
              Swal.close();
              console.error('Error en la solicitud:', error);
              this.popUpManager.showErrorAlert(this.translate.instant('ERROR.REGISTRAR') + ": " + (error.message || 'Error desconocido'));
              return of(null); 
          })
      ).subscribe();
      }
    })
  }

  cargarCamposExistentes() {
    this.oikosService.get('campo?limit=-1&query=Activo:true').subscribe((res: any) => {
      if (res && res.length > 0) {
        this.camposExistentes = res.map((campo: any) => ({
          idCampo: campo.Id,
          nombreCampo: campo.Nombre,
          descripcion: campo.Descripcion,
          codigoAbreviacion: campo.CodigoAbreviacion
        }));
      }
    });
  }

  mostrarSelectorDeCampos(): void {
    const dialogRef = this.dialog.open(SeleccionarCampoDialogComponent, {
      width: '500px',
      data: this.camposExistentes,
    });

    dialogRef.afterClosed().subscribe((campoSeleccionado) => {
      if (campoSeleccionado) {
        this.agregarCampoExistente(campoSeleccionado);
      }
    });
  }

  agregarCampoExistente(campo: Campo) {
    const existeCampo = this.camposDinamicos.controls.some((control: AbstractControl) => {
      const formGroup = control as FormGroup;
      return formGroup.get('idCampo')?.value === campo.idCampo;
    });
    if (existeCampo) {
      this.popUpManager.showErrorAlert('El campo ya existe en este espacio físico.');
      return;
    }
    const campoNoEditable = new FormGroup({
      idCampo: new FormControl(campo.idCampo),
      nombre_campo: new FormControl({ value: campo.nombreCampo, disabled: true }),
      descripcion: new FormControl({ value: campo.descripcion, disabled: true }),
      codigo_abreviacion: new FormControl({ value: campo.codigoAbreviacion, disabled: true }),
      valor: new FormControl('', [Validators.required, Validators.pattern(/^\S.*$/)]),
    });
    this.camposDinamicos.push(campoNoEditable);
    console.log(campoNoEditable.get("idCampo")?.value)
  }

  eliminarCampo(index: number) {
    this.camposDinamicos.removeAt(index);
  }
}
