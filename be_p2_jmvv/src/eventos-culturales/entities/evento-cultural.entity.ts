import { 
    Column, 
    CreateDateColumn, 
    DeleteDateColumn, 
    Entity, 
    JoinColumn, 
    ManyToOne, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn 
} from 'typeorm';
import { Recinto } from '../../recintos/entities/recinto.entity';

export enum EstadoEvento {
  PROGRAMADO = 'Programado',
  AGOTADO = 'Agotado',
  CANCELADO = 'Cancelado',
}

export enum ModalidadIngreso {
  ENTRADA_PAGADA = 'Entrada Pagada',
  ENTRADA_GRATUITA = 'Entrada Gratuita',
  PASE_INVITACION = 'Pase Invitacion',
}


@Entity('eventos_culturales')
export class EventoCultural {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_recinto', nullable: false })
  id_recinto: number;

  @ManyToOne(() => Recinto, (recinto) => recinto.eventos)
  @JoinColumn({ name: 'id_recinto' })
  recinto: Recinto;

  @Column({ type: 'varchar', length: 150, nullable: false })
  titulo: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  artista_principal: string;

  @Column({ type: 'int', nullable: false })
  duracion_minutos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precio_entrada: number;

  @Column({ type: 'date', nullable: false })
  fecha_evento: Date;

  @Column({ type: 'enum', enum: EstadoEvento, nullable: false })
  estado: EstadoEvento;

  @Column({ type: 'varchar', length: 50, nullable: false, default: 'Entrada Pagada' })
  modalidad_ingreso: ModalidadIngreso;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}