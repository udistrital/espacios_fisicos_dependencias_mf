import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OikosService } from 'src/app/services/oikos.service';
import { OikosMidService } from 'src/app/services/oikos_mid.service';
import { Output, EventEmitter } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { BusquedaCampo } from 'src/app/models/busquedaCampo.models';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-editar-campo-dialog',
  templateUrl: './editar-campo-dialog.component.html',
  styleUrls: ['./editar-campo-dialog.component.css']
})
export class EditarCampoDialogComponent implements OnInit {
  element: BusquedaCampo;
  editarCampoForm!: FormGroup;
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditarCampoDialogComponent>,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    public oikosService: OikosService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public oikosMidService: OikosMidService,
  ) {
    translate.setDefaultLang('es');
    this.element = data;

  }

  ngOnInit() {
    this.iniciarFormulario();
    this.cargarDatos();
  }

  iniciarFormulario() {
    this.editarCampoForm = new FormGroup({
      nombreCampo: new FormControl<string | null>("", {
        nonNullable: false,
        validators: [Validators.required],
      }),
      descripcion: new FormControl<string | null>("", {
        nonNullable: false,
        validators: [Validators.required],
      }),
      cod_abreviacion: new FormControl<string | null>("", {}),
    });
  }

  cargarDatos(){
    this.editarCampoForm.get("nombreCampo")?.setValue(this.element.nombre);
    this.editarCampoForm.get("descripcion")?.setValue(this.element.descripcion);
    this.editarCampoForm.get("cod_abreviacion")?.setValue(this.element.cod_abreviacion);
  }

  async editarCampo() {
    try {
        const result = await this.popUpManager.showConfirmAlert(
            this.translate.instant('CONFIRMACION.EDITAR_CAMPO.PREGUNTA'),
            this.translate.instant('CONFIRMACION.EDITAR_CAMPO.CONFIRMAR'),
            this.translate.instant('CONFIRMACION.EDITAR_CAMPO.DENEGAR')
        );

        if (result) {
            this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.EDITAR_CAMPO'));
            const formValues = this.editarCampoForm.value;
            const campoModificado = {
                Id: this.element.id,
                Nombre: formValues.nombreCampo,
                CodigoAbreviacion: formValues.cod_abreviacion.toUpperCase(),
                Descripcion: formValues.descripcion,
                FechaModificacion: new Date().toISOString(),
                FechaCreacion: this.element.fechaCreacion,
                Activo: this.element.estado === 'ACTIVA',
            };

            try {
                const response: any = await this.oikosService.put("campo", campoModificado).toPromise();
                
                Swal.close();
                if (response) {
                    this.popUpManager.showSuccessAlert(
                        this.translate.instant('EXITO.EDITAR_CAMPO'),
                        () => this.dialogRef.close(true)
                    );
                } else {
                    this.popUpManager.showErrorAlert(this.translate.instant('ERROR.EDITAR_CAMPO'));
                }
            } catch (error) {
                Swal.close(); 
                this.popUpManager.showErrorAlert(
                    this.translate.instant('ERROR.EDITAR_CAMPO') +
                    ": " +
                    this.translate.instant('ERROR.DESCONOCIDO')
                );
            }
        }
    } catch (error) {
        console.error("Error al mostrar el confirm popup:", error);
    }
  }


  onCloseClick() {
    this.dialogRef.close();
  }

}
