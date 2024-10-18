import { Desplegables } from "./desplegables.models";

export interface BusquedaGestion {
    id: number;
    nombre: string;
    telefono: string;
    correo: string;
    dependenciasAsociadas: Desplegables;
    tipoDependencia: Desplegables[];
    estado: string;
}