import { Campo } from "./campo.models";
import { Desplegables } from "./desplegables.models";

export interface EditarDetalles {
    id: number;
    nombre: string;
    cod_abreviacion: string;
    tipoEspacio: Desplegables;
    descripcion: string;
    tipoUso: Desplegables;
    tipoEdificacion: number;
    tipoTerreno: number;
    dependenciaPadre: Desplegables;
    campos: Campo[];
    gestion: boolean;
}