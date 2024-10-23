import { Campo } from "./campo.models";

export interface BusquedaGestion {
    id: number;
    nombre: string;
    cod_abreviacion: string;
    descripcion: string;
    estado: string;
    tipoEspacio: string;
    tipoUso: string;
    tipoEdificacion: string;
    tipoTerreno: string;
    dependenciaPadre: string;
    campos: Campo[];
    observaciones: string;
}