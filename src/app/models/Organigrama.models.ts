import { Dependencia } from "./Dependencia.models";

export interface Organigrama {
    Dependencia: Dependencia;
    Tipo:   string[];
    Hijos:  Organigrama[];

}