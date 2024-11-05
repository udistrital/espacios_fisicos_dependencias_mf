import { Component, Input, OnInit } from '@angular/core';
import { PopUpManager } from '../../managers/popUpManager';
import { FormControl, FormGroup, Validators, FormArray  } from '@angular/forms';
import { Desplegables } from 'src/app/models/desplegables.models';
import { MatDialogRef } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Campo } from 'src/app/models/campo.models';
import { OikosService } from 'src/app/services/oikos.service';
import { OikosMidService } from 'src/app/services/oikos_mid.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';

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

  campos: Array<Campo> = [];

  constructor(
    private popUpManager: PopUpManager,
    public dialogRef: MatDialogRef<RegistroEspaciosComponent>,
    private translate: TranslateService,
    public oikosService: OikosService,
    public oikosMidService: OikosMidService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.cargarTiposEspacioFisico();
    this.cargarTiposUso();
    this.cargarDependencias();
  }

  ngOnInit() {
    this.iniciarFormularioConsulta();
  }

  iniciarFormularioConsulta() {
    this.registroForm = new FormGroup({
      nombre: new FormControl<string | null>("", {
        nonNullable: false,
        validators: [Validators.required]
      }),
      codigo_abreviacion: new FormControl<string | null>("", {
        nonNullable: true,
        validators: [Validators.required]
      }),
      dependencia_padre: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      descripcion: new FormControl<string | null>("", {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tipo_espacio_fisico: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tipo_uso: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tipo_edificacion: new FormControl<string | null>("", {
        nonNullable: true,
        validators: [],
      }),
      tipo_terreno: new FormControl<string | null>("", {
        nonNullable: true,
        validators: [],
      }),
      camposDinamicos: new FormArray([])
    });
  }

  get camposDinamicos(): FormArray {
    return this.registroForm.get('camposDinamicos') as FormArray;
  }

  agregarCampo() {
    const nuevoCampo = new FormGroup({
      nombre_campo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      codigo_abreviacion: new FormControl('', Validators.required),
    });
    this.camposDinamicos.push(nuevoCampo);
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
    const camposDinamicos = this.camposDinamicos.controls.map(campo => ({
      NombreCampo: campo.get('nombre_campo')?.value,
      Descripcion: campo.get('descripcion')?.value,
      CodigoAbreviacion: campo.get('codigo_abreviacion')?.value
    }));
    return{
      EspacioFisico:{
        Nombre: formValues.nombre,
        Descripcion: formValues.descripcion,
        CodigoAbreviacion: formValues.codigo_abreviacion
      },
      TipoEspacioFisico: formValues.tipo_espacio_fisico?.id,
      TipoUso: formValues.tipo_uso?.id,
      DependenciaPadre: formValues.dependencia_padre?.id,
      TipoEdificacion: formValues.tipo_edificacion || 0,
      TipoTerreno: formValues.tipo_terreno || 0,
      CamposDinamicos: camposDinamicos
    }
  }

  enviarEspacioFisico(){
    this.popUpManager.showConfirmAlert(this.translate.instant('CONFIRMACION.REGISTRAR.PREGUNTA'),this.translate.instant('CONFIRMACION.REGISTRAR.CONFIRMAR'),this.translate.instant('CONFIRMACION.REGISTRAR.DENEGAR')).then((result) =>{
      if (result === true){
        const registro = this.construirObjetoRegistro();
        console.log(registro);
        this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.REGISTRO'));
        this.oikosMidService.post("gestion_espacios_fisicos_mid/RegistroEspacioFisico", registro).pipe(
          tap((res: any) => {
              if (res.Success) {
                  Swal.close();
                  this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.REGISTRAR'));
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

  eliminarCampo(index: number) {
    this.camposDinamicos.removeAt(index);
  }
}
