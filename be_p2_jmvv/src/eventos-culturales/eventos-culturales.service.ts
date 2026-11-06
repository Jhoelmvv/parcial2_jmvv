import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventoCulturalDto } from './dto/create-evento-cultural.dto';
import { UpdateEventoCulturalDto } from './dto/update-evento-cultural.dto';
import { EventoCultural } from './entities/evento-cultural.entity';

@Injectable()
export class EventosCulturalesService {
  constructor(
    @InjectRepository(EventoCultural)
    private eventoRepository: Repository<EventoCultural>,
  ) {}

  create(createEventoCulturalDto: CreateEventoCulturalDto) {
    return this.eventoRepository.save(createEventoCulturalDto);
  }

  findAll() {
    return this.eventoRepository.find({
      order: { fecha_evento: 'ASC' },
      relations: { recinto: true },
    });
  }

  findOne(id: number) {
    return this.eventoRepository.findOne({
      where: { id },
      relations: { recinto: true },
    });
  }

  async update(id: number, updateEventoCulturalDto: UpdateEventoCulturalDto) {
    await this.eventoRepository.update(id, updateEventoCulturalDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.eventoRepository.softDelete(id);
  }
}