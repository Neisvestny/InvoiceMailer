import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateCompanyDto) {
		return this.prisma.company.create({
			data: {
				name: dto.name,
				address: dto.address,
				clients: dto.clients
					? {
							create: dto.clients.map((client) => ({
								email: client.email,
								firstName: client.firstName,
								lastName: client.lastName,
							})),
						}
					: undefined,
			},
			include: { clients: true },
		});
	}

	findAll() {
		return this.prisma.company.findMany({
			include: { clients: true },
		});
	}

	async findOne(id: string) {
		const company = await this.prisma.company.findUnique({
			where: { id },
			include: { clients: true },
		});
		if (!company) throw new NotFoundException(`Company ${id} not found`);
		return company;
	}

	async update(id: string, dto: UpdateCompanyDto) {
		await this.findOne(id);

		return this.prisma.company.update({
			where: { id },
			data: {
				name: dto.name,
				address: dto.address,
				clients: dto.clients
					? {
							create: dto.clients.map((client) => ({
								email: client.email,
								firstName: client.firstName,
								lastName: client.lastName,
							})),
						}
					: undefined,
			},
			include: { clients: true },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		return this.prisma.company.delete({ where: { id } });
	}
}
