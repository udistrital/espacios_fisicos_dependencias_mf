import { Injectable } from '@angular/core';
// @ts-ignore
import Swal, { SweetAlertResult } from 'sweetalert2/dist/sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})

export class PopUpManager {
    constructor(
        private translate: TranslateService,
    ) { 
        translate.setDefaultLang('es');
    }

    showSuccessAlert(text: string) {
        Swal.fire({
            icon: this.translate.instant('POP_UP.ICONO.EXITO'),
            title: this.translate.instant('POP_UP.TITULO.EXITO'),
            text: text,
            confirmButtonText: this.translate.instant('POP_UP.CONFIRMACION'),
        });
    }
    showErrorAlert(text: string) {
        Swal.fire({
            icon: this.translate.instant('POP_UP.ICONO.ERROR'),
            title: this.translate.instant('POP_UP.TITULO.ERROR'),
            text: text,
            confirmButtonText: this.translate.instant('POP_UP.CONFIRMACION'),
        });
    }
    showLoaderAlert(text: string){
        Swal.fire({
            title: text,
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: 2000,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    showConfirmAlert(titulo: string, confirmar: string, denegar: string): Promise<boolean | null> {
        return Swal.fire({
            title: titulo,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: confirmar,
            denyButtonText: denegar,
        }).then((result: SweetAlertResult ) => {
            if (result.isConfirmed) {
                return true;
            } else if (result.isDenied) {
                Swal.fire(this.translate.instant('CONFIRMACION.DENEGACION'), '', this.translate.instant('POP_UP.ICONO.INFO'));
                return false;
            } else {
                return null; 
            }
        });
    }

}
