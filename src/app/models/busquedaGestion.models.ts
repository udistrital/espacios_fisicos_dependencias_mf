import { Campo } from "./campo.models";
import { Desplegables } from "./desplegables.models";

export interface BusquedaGestion {
    id: number;
    nombre: string;
    cod_abreviacion: string;
    descripcion: string;
    estado: string;
    tipoEspacio: Desplegables;
    tipoUso: Desplegables;
    tipoEdificacion: string;
    tipoTerreno: string;
    dependenciaPadre: Desplegables;
    campos: Campo[];
}