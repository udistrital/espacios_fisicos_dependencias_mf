import { Component, Input, OnInit } from '@angular/core';
import { PopUpManager } from '../../managers/popUpManager';
import { FormControl, FormGroup, Validators, FormArray  } from '@angular/forms';
import { Desplegables } from 'src/app/models/desplegables.models';
import { MatDialogRef } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Campo } from 'src/app/models/campo.models';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-registro-espacios',
  templateUrl: './registro-espacios.component.html',
  styleUrls: ['./registro-espacios.component.css']
})
export class RegistroEspaciosComponent implements OnInit {

  @Input('normalform') normalform: any;

  tiposDependencia: Desplegables[] = [];
  dependenciasAsociadas: Desplegables[] = [];
  registroForm!: FormGroup;

  campos: Array<Campo> = [];

  constructor(
    private popUpManager: PopUpManager,
    public dialogRef: MatDialogRef<RegistroEspaciosComponent>,
    private translate: TranslateService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    // this.cargarTiposDependencia();
    // this.cargarDependenciasAsociadas();
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

  eliminarCampo(index: number) {
    this.camposDinamicos.removeAt(index);
  }
}
