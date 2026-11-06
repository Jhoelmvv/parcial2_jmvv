import { 
    Column, 
    CreateDateColumn, 
    DeleteDateColumn, 
    Entity, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn, 
    OneToMany 
} from 'typeorm';
import { EventoCultural } from '../../eventos-culturales/entities/evento-cultural.entity';

@Entity('recintos')
export class Recinto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  ciudad: string;

  @Column({ type: 'int', nullable: true })
  aforo_maximo: number;

  @OneToMany(() => EventoCultural, (evento: EventoCultural) => evento.recinto)
  eventos: EventoCultural[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}