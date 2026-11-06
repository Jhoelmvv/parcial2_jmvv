import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsDefined, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { EstadoEvento } from '../entities/evento-cultural.entity';

export class CreateEventoCulturalDto {
  @ApiProperty()
  @IsDefined({ message: 'El id del recinto es obligatorio' })
  @IsInt({ message: 'El id del recinto debe ser tipo numérico' })
  readonly id_recinto: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser de tipo cadena' })
  @MaxLength(150, { message: 'El título no puede tener más de 150 caracteres' })
  @Transform(({ value }): string | undefined => (typeof value === 'string' ? value.trim() : value))
  readonly titulo: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El artista principal es obligatorio' })
  @IsString({ message: 'El artista principal debe ser de tipo cadena' })
  @MaxLength(100, { message: 'El artista principal no puede tener más de 100 caracteres' })
  @Transform(({ value }): string | undefined => (typeof value === 'string' ? value.trim() : value))
  readonly artista_principal: string;

  @ApiProperty()
  @IsDefined({ message: 'La duración es obligatoria' })
  @IsInt({ message: 'La duración debe ser un número entero' })
  readonly duracion_minutos: number;

  @ApiProperty()
  @IsDefined({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio de la entrada debe ser numérico' })
  readonly precio_entrada: number;

  @ApiProperty({ example: '2026-11-20' })
  @IsDefined({ message: 'La fecha del evento es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener un formato válido (YYYY-MM-DD)' })
  readonly fecha_evento: Date;

  @ApiProperty({ enum: EstadoEvento })
  @IsDefined({ message: 'El estado es obligatorio' })
  @IsEnum(EstadoEvento, { message: 'El estado debe ser Programado, Agotado o Cancelado' })
  readonly estado: EstadoEvento;
}