import { Component, Inject } from '@angular/core';
import { Campo } from 'src/app/models/campo.models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-seleccionar-campo-dialog',
  templateUrl: './seleccionar-campo-dialog.component.html',
  styleUrls: ['./seleccionar-campo-dialog.component.css']
})
export class SeleccionarCampoDialogComponent {
  campoSeleccionado?: any;

  constructor(
    public dialogRef: MatDialogRef<SeleccionarCampoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public campos: any[]
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.campoSeleccionado);
  }
}
