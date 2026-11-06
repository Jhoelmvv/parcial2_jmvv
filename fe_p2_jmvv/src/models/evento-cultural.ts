export interface Recinto {
  id?: number;
  nombre: string;
  ciudad: string;
  aforo_maximo?: number;
}

export interface EventoCultural {
  id?: number;
  id_recinto: number;
  titulo: string;
  artista_principal: string;
  duracion_minutos: number;
  precio_entrada: number;
  fecha_evento: string;
  estado: 'Programado' | 'Agotado' | 'Cancelado';
}