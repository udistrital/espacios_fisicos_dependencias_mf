import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { EditarDetalles } from 'src/app/models/editarDetalles.models';
import { FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Campo } from 'src/app/models/campo.models';
import { MatDialog } from '@angular/material/dialog';
import { Desplegables } from 'src/app/models/desplegables.models';
import { OikosService } from 'src/app/services/oikos.service';
import { OikosMidService } from 'src/app/services/oikos_mid.service';
import { Output, EventEmitter } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SeleccionarCampoDialogComponent } from './seleccionar-campo-dialog/seleccionar-campo-dialog.component';
@Component({
  selector: 'app-editar-espacio-dialog',
  templateUrl: './editar-espacio-dialog.component.html',
  styleUrls: ['./editar-espacio-dialog.component.css']
})
export class EditarEspacioDialogComponent implements OnInit {
  tipo: string;
  element: EditarDetalles;
  campos: Array<Campo> = [];
  tipo_espacio_fisico: Desplegables[] = [];
  tipo_uso: Desplegables[] = [];
  dependencias: Desplegables[] = [];
  editarForm: FormGroup;
  nombreTipoEspacio: string | null = null;   
  nombreDependencia: string | null = null;   
  nombreTipoUso: string | null = null;   
  mostrarSelector: boolean = false;
  campoSeleccionado: Campo | null = null;
  camposExistentes: Array<Campo> = [];
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditarEspacioDialogComponent>,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    public oikosService: OikosService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public oikosMidService: OikosMidService,
  ) {
    translate.setDefaultLang('es');
    this.element = data.element;
    this.tipo = data.tipo;
    this.editarForm = new FormGroup({});
    if (this.element.gestion){
      this.dependencias = data.dependencias;
      this.tipo_uso = data.tipo_uso;
      this.tipo_espacio_fisico = data.tipo_espacio_fisico;
    }
  }

  ngOnInit(): void {
    this.iniciarFormulario();
    this.cargarDatos();
    this.cargarCamposExistentes();
  }

  get camposDinamicos(): FormArray {
    return this.editarForm.get('camposDinamicos') as FormArray;
  }

  iniciarFormulario() {
    this.editarForm = new FormGroup({
      nombre: new FormControl<string | null>("", {
        nonNullable: false,
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
      tipo_edificacion: new FormControl<number | null>(0, {validators: Validators.min(0)}),
      tipo_terreno: new FormControl<number | null>(0, {validators: Validators.min(0)}),
      camposDinamicos: new FormArray([]),
    });
  }

  cargarDatos() {
    setTimeout(() => {
      if (this.element) {
        if(this.element.gestion){
          this.asignarDependencia(this.element.id);
          const tipoEspacioPreseleccionado = this.tipo_espacio_fisico.find(espacio => espacio.id === this.element.tipoEspacio?.id) || null;
          this.editarForm.get('tipo_espacio_fisico')?.setValue(tipoEspacioPreseleccionado);
          this.nombreTipoEspacio = tipoEspacioPreseleccionado ? tipoEspacioPreseleccionado.nombre : null;
          const tipoUsoPreseleccionado = this.tipo_uso.find(uso => uso.id === this.element.tipoUso?.id) || null;
          this.editarForm.get('tipo_uso')?.setValue(tipoUsoPreseleccionado);
          this.nombreTipoUso = tipoUsoPreseleccionado ? tipoUsoPreseleccionado.nombre : null;
  
          this.editarForm.get('tipo_edificacion')?.setValue(this.element.tipoEdificacion || 0);
          this.editarForm.get('tipo_terreno')?.setValue(this.element.tipoTerreno || 0);
          this.cdr.detectChanges();
        }else{
          this.nombreDependencia = this.element.dependenciaPadre.nombre;
          this.nombreTipoEspacio = this.element.tipoEspacio.nombre;
          this.asignarTipoUso(this.element.id);
        }
        this.cargarCampos(this.element.id);
        this.editarForm.get('nombre')?.setValue(this.element.nombre || '');
        this.editarForm.get('codigo_abreviacion')?.setValue(this.element.cod_abreviacion || '');
        this.editarForm.get('descripcion')?.setValue(this.element.descripcion || '');
      }
    }, 0);
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

  asignarTipoUso(id:number){
    this.oikosService.get('tipo_uso_espacio_fisico?limit=-1&query=EspacioFisicoId.Id:' + id +',Activo:true').subscribe((res: any) => {
      if (res && res.length > 0) {
        const item = res[0];
        this.nombreTipoUso = item.TipoUsoId.Nombre;
      } else {
        this.nombreTipoUso = null;
      }
      this.cdr.detectChanges(); 
    });
  }

  cargarCampos(id: number) {
    this.camposDinamicos.clear();
    this.oikosService.get('espacio_fisico_campo?limit=-1&query=EspacioFisicoId.Id:' + id + ',Activo:true').subscribe((res: any) => {
      if (res && res.length > 0) {
        res.forEach((item: any) => {
            if (item.CampoId) {
                const nuevoCampo = new FormGroup({
                    idCampo: new FormControl(item.Id),
                    nombre_campo: new FormControl(item.CampoId.Nombre, Validators.required),
                    descripcion: new FormControl(item.CampoId.Descripcion, Validators.required),
                    codigo_abreviacion: new FormControl(item.CampoId.CodigoAbreviacion),
                    valor: new FormControl(item.Valor, [Validators.required, Validators.pattern(/^\S.*$/)]),
                    existente: new FormControl(true),
                    idCampoOriginal: new FormControl(item.CampoId.Id)
                });
                this.camposDinamicos.push(nuevoCampo);
            }
        });
      }
    });
  }
  
  agregarCampoExistente(campo: Campo) {
    const existeCampo = this.camposDinamicos.controls.some((control: AbstractControl) => {
      const formGroup = control as FormGroup;
      return formGroup.get('idCampoOriginal')?.value === campo.idCampo || formGroup.get('idCampo')?.value === campo.idCampo;
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
      existente: new FormControl(false),
    });
    this.camposDinamicos.push(campoNoEditable);
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

  seleccionarCampo(campo: Campo) {
    this.campoSeleccionado = campo;
    this.agregarCampoExistente(campo);
    this.mostrarSelector = false;
  }

  


  construirEdicion(){
    const formValues = this.editarForm.value;
    const camposDinamicos = this.camposDinamicos.controls.map(campo => ({
      IdCampo: campo.get('idCampo')?.value,
      Valor: campo.get('valor')?.value.toUpperCase(),
      Existente: campo.get('existente')?.value
    }));
    const camposExistentes = camposDinamicos.filter(campo => campo.Existente === true);
    const camposNoExistentes = camposDinamicos.filter(campo => campo.Existente === false);
    return {
      EspacioId: this.element.id,
      TipoEspacioId: formValues.tipo_espacio_fisico.id,
      TipoUsoId: formValues.tipo_uso.id,
      DependenciaId: formValues.dependencia_padre.id,
      Nombre: formValues.nombre.toUpperCase(),
      Descripcion: formValues.descripcion,
      CodAbreviacion: formValues.codigo_abreviacion.toUpperCase(),
      TipoEdificacion: formValues.tipo_edificacion,
      TipoTerreno: formValues.tipo_terreno,
      CamposExistentes: camposExistentes,
      CamposNoExistentes: camposNoExistentes
    };
  }

  @Output() espacioActualizado = new EventEmitter<void>();

  editarEspacio() {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('CONFIRMACION.EDITAR.PREGUNTA'),
      this.translate.instant('CONFIRMACION.EDITAR.CONFIRMAR'),
      this.translate.instant('CONFIRMACION.EDITAR.DENEGAR')
    ).then((result) => {
      if (result === true) {
        this.popUpManager.showLoaderAlert(this.translate.instant('CARGA.EDITAR'));
        const editar = this.construirEdicion();
        this.oikosMidService.post("EditarEspacioFisico", editar).pipe(
          tap((res: any) => {
            if (res.Success) {
              this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.EDITAR'), () => {
                this.espacioActualizado.emit();  
                this.dialogRef.close({success:true, 
                                      nombre: editar.Nombre,
                                      tipo_uso: editar.TipoUsoId,
                                      dependencia: editar.DependenciaId,
                                      tipo_espacio: editar.TipoEspacioId});  
              });
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('ERROR.EDITAR'));
            }
          }),
          catchError((error) => {
            console.error('Error en la solicitud:', error);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.EDITAR') + ": " + (error.message || this.translate.instant('ERROR.DESCONOCIDO')));
            return of(null); 
          })
        ).subscribe();
      }
    });
  }
}
