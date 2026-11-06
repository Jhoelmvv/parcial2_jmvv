import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecintoDto } from './dto/create-recinto.dto';
import { UpdateRecintoDto } from './dto/update-recinto.dto';
import { Recinto } from './entities/recinto.entity';

@Injectable()
export class RecintosService {
  constructor(
    @InjectRepository(Recinto)
    private readonly recintoRepository: Repository<Recinto>,
  ) {}

  create(createRecintoDto: CreateRecintoDto) {
    return this.recintoRepository.save(createRecintoDto);
  }

  findAll() {
    return this.recintoRepository.find();
  }

  findOne(id: number) {
    return this.recintoRepository.findOne({ where: { id } });
  }

  async update(id: number, updateRecintoDto: UpdateRecintoDto) {
    await this.recintoRepository.update(id, updateRecintoDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.recintoRepository.softDelete(id);
  }
}
