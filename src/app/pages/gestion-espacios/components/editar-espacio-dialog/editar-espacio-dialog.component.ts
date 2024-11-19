import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { BusquedaGestion } from 'src/app/models/busquedaGestion.models';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Campo } from 'src/app/models/campo.models';
import { Desplegables } from 'src/app/models/desplegables.models';
import { OikosService } from 'src/app/services/oikos.service';
import { OikosMidService } from 'src/app/services/oikos_mid.service';
import { Output, EventEmitter } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-editar-espacio-dialog',
  templateUrl: './editar-espacio-dialog.component.html',
  styleUrls: ['./editar-espacio-dialog.component.css']
})
export class EditarEspacioDialogComponent implements OnInit {
  tipo: string;
  element: BusquedaGestion;
  campos: Array<Campo> = [];
  tipo_espacio_fisico: Desplegables[] = [];
  tipo_uso: Desplegables[] = [];
  dependencias: Desplegables[] = [];
  editarForm: FormGroup;
  nombreTipoEspacio: string | null = null;   
  nombreDependencia: string | null = null;   
  nombreTipoUso: string | null = null;   

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditarEspacioDialogComponent>,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    public oikosService: OikosService,
    private cdr: ChangeDetectorRef,
    public oikosMidService: OikosMidService,
  ) {
    translate.setDefaultLang('es');
    this.element = data.element;
    this.dependencias = data.dependencias;
    this.tipo_uso = data.tipo_uso;
    this.tipo_espacio_fisico = data.tipo_espacio_fisico;
    this.tipo = data.tipo;

    this.editarForm = new FormGroup({});
  }

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarDatos();
  }

  get camposDinamicos(): FormArray {
    return this.editarForm.get('camposDinamicos') as FormArray;
  }

  iniciarFormulario() {
    this.editarForm = new FormGroup({
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
      tipo_edificacion: new FormControl<string | null>("", {}),
      tipo_terreno: new FormControl<string | null>("", {}),
      camposDinamicos: new FormArray([]),
    });
  }

  cargarDatos() {
    setTimeout(() => {
      if (this.element) {
        this.asignarDependencia(this.element.id);
        this.editarForm.get('nombre')?.setValue(this.element.nombre || '');
        this.editarForm.get('codigo_abreviacion')?.setValue(this.element.cod_abreviacion || '');
        this.editarForm.get('descripcion')?.setValue(this.element.descripcion || '');

        const tipoEspacioPreseleccionado = this.tipo_espacio_fisico.find(espacio => espacio.id === this.element.tipoEspacio?.id) || null;
        this.editarForm.get('tipo_espacio_fisico')?.setValue(tipoEspacioPreseleccionado);
        this.nombreTipoEspacio = tipoEspacioPreseleccionado ? tipoEspacioPreseleccionado.nombre : null;

        const tipoUsoPreseleccionado = this.tipo_uso.find(uso => uso.id === this.element.tipoUso?.id) || null;
        this.editarForm.get('tipo_uso')?.setValue(tipoUsoPreseleccionado);
        this.nombreTipoUso = tipoUsoPreseleccionado ? tipoUsoPreseleccionado.nombre : null;

        this.editarForm.get('tipo_edificacion')?.setValue(this.element.tipoEdificacion || '');
        this.editarForm.get('tipo_terreno')?.setValue(this.element.tipoTerreno || '');
        // this.camposDinamicos.clear();
        // console.log(this.element.campos)
        // this.element.campos.forEach(campo => {
        //   const nuevoCampo = new FormGroup({
        //     nombre_campo: new FormControl(campo.nombreCampo, Validators.required),
        //     descripcion: new FormControl(campo.descripcion, Validators.required),
        //     codigo_abreviacion: new FormControl(campo.codigoAbreviacion, Validators.required),
        //   });
        //   this.camposDinamicos.push(nuevoCampo);
        // });

        this.cdr.detectChanges(); // Forzar la detección de cambios
      }
    }, 0);
  }

  agregarCampo() {
    const nuevoCampo = new FormGroup({
      nombre_campo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      codigo_abreviacion: new FormControl('', Validators.required),
    });
    this.camposDinamicos.push(nuevoCampo);
  }

  eliminarCampo(index: number) {
    this.camposDinamicos.removeAt(index);
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  asignarDependencia(id: number) {
    this.oikosService.get('asignacion_espacio_fisico_dependencia?limit=-1&query=EspacioFisicoId.Id:' + id +',Activo:true').subscribe((res: any) => {
      if (res && res.length > 0) {
        const item = res[0];
        this.element.dependenciaPadre = {
          id: item.DependenciaId.Id,
          nombre: item.DependenciaId.Nombre
        };
        const dependenciaPreseleccionada = this.dependencias.find(dep => dep.id === this.element.dependenciaPadre.id) || null;
        this.editarForm.get('dependencia_padre')?.setValue(dependenciaPreseleccionada);
        this.nombreDependencia = dependenciaPreseleccionada ? dependenciaPreseleccionada.nombre : null;
      } else {
        this.element.dependenciaPadre = {
          id: 0,
          nombre: ""
        };
        this.nombreDependencia = null;
      }
      this.cdr.detectChanges(); 
    });
  }

  construirEdicion(){
    const formValues = this.editarForm.value;
    return {
      EspacioId: this.element.id,
      TipoEspacioId: formValues.tipo_espacio_fisico.id,
      TipoUsoId: formValues.tipo_uso.id,
      DependenciaId: formValues.dependencia_padre.id,
      Nombre: formValues.nombre,
      Descripcion: formValues.descripcion,
      CodAbreviacion: formValues.codigo_abreviacion,
      TipoEdificacion: formValues.tipo_edificacion,
      TipoTerreno: formValues.tipo_terreno
    };
  }

  @Output() espacioActualizado = new EventEmitter<void>();

  editarEspacio(){
    this.popUpManager.showConfirmAlert(this.translate.instant('CONFIRMACION.EDITAR.PREGUNTA'),this.translate.instant('CONFIRMACION.EDITAR.CONFIRMAR'),this.translate.instant('CONFIRMACION.EDITAR.DENEGAR')).then((result) =>{
      if (result === true){
        this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.EDITAR'));
        const editar = this.construirEdicion();
        console.log(editar);
        this.oikosMidService.post("gestion_espacios_fisicos_mid/EditarEspacioFisico", editar).pipe(
          tap((res: any) => {
              if (res.Success) {
                  this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.EDITAR'));
                  this.espacioActualizado.emit();
              } else {
                  this.popUpManager.showErrorAlert(this.translate.instant('ERROR.EDITAR'));
              }
          }),
          catchError((error) => {
              console.error('Error en la solicitud:', error);
              this.popUpManager.showErrorAlert(this.translate.instant('ERROR.EDITAR') +": " + (error.message || this.translate.instant('ERROR.DESCONOCIDO')));
              return of(null); 
          })
        ).subscribe();
        this.dialogRef.close();
      }
    })
  }
}
