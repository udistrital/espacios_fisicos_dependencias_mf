import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { BusquedaGestion } from 'src/app/models/busquedaGestion.models';
import { FormControl, FormGroup, Validators, FormArray  } from '@angular/forms';
import { ThisReceiver } from '@angular/compiler';
import { Campo } from 'src/app/models/campo.models';

@Component({
  selector: 'app-editar-espacio-dialog',
  templateUrl: './editar-espacio-dialog.component.html',
  styleUrls: ['./editar-espacio-dialog.component.css']
})
export class EditarEspacioDialogComponent {
  tipo: string;
  element: BusquedaGestion;
  campos: Array<Campo> = [];

  
  editarForm = new FormGroup({
    nombre: new FormControl<string | null>("", {
      nonNullable: false,
      validators: [Validators.required]
    }),
    codigo_abreviacion: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required]
    }),
    dependencia_padre: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    descripcion: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipo_espacio_fisico: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipo_uso: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipo_edificacion: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipo_terreno: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
    camposDinamicos: new FormArray([]),
    observaciones: new FormControl<string | null>("", {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditarEspacioDialogComponent>,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    translate.setDefaultLang('es');
    this.element = data.element;
    console.log(this.element);
    this.tipo = data.tipo;
    this.cargarDatos();

  }

  get camposDinamicos(): FormArray {
    return this.editarForm.get('camposDinamicos') as FormArray;
  }

  cargarDatos(){
    this.editarForm.get('nombre')?.setValue(this.element.nombre);
    this.editarForm.get('codigo_abreviacion')?.setValue(this.element.cod_abreviacion);
    this.editarForm.get('descripcion')?.setValue(this.element.descripcion);
    this.editarForm.get('tipo_espacio_fisico')?.setValue(this.element.tipoEspacio);
    this.editarForm.get('tipo_uso')?.setValue(this.element.tipoUso);
    this.editarForm.get('tipo_edificacion')?.setValue(this.element.tipoEdificacion);
    this.editarForm.get('tipo_terreno')?.setValue(this.element.tipoTerreno);
    this.editarForm.get('dependencia_padre')?.setValue(this.element.dependenciaPadre);
    this.editarForm.get('observaciones')?.setValue(this.element.observaciones);
    this.camposDinamicos.clear();
    console.log(this.element.campos)
    this.element.campos.forEach(campo => {
      const nuevoCampo = new FormGroup({
        nombre_campo: new FormControl(campo.nombreCampo, Validators.required),
        descripcion: new FormControl(campo.descripcion, Validators.required),
        codigo_abreviacion: new FormControl(campo.codigoAbreviacion, Validators.required),
      });
      this.camposDinamicos.push(nuevoCampo);
    });
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
  
  onCloseClick(){
    this.dialogRef.close();
  }
}
