import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateClientDto) {
		try {
			if (dto.companyId) {
				const company = await this.prisma.company.findUnique({
					where: { id: dto.companyId },
				});
				if (!company) {
					throw new NotFoundException(`Company ${dto.companyId} not found`);
				}
			}

			return await this.prisma.client.create({
				data: dto,
				include: { company: true },
			});
		} catch (error: unknown) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ConflictException('Client with this email already exists');
				}
			}

			throw error;
		}
	}

	findAll() {
		return this.prisma.client.findMany({
			include: { company: true },
		});
	}

	async findOne(id: string) {
		const client = await this.prisma.client.findUnique({
			where: { id },
			include: { company: true },
		});
		if (!client) throw new NotFoundException(`Client ${id} not found`);
		return client;
	}

	async update(id: string, dto: UpdateClientDto) {
		await this.findOne(id);

		if (dto.companyId) {
			const company = await this.prisma.company.findUnique({
				where: { id: dto.companyId },
			});
			if (!company) throw new NotFoundException(`Company ${dto.companyId} not found`);
		}

		return this.prisma.client.update({
			where: { id },
			data: dto,
			include: { company: true },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prisma.client.delete({ where: { id } });
	}
}
