import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { PDF_QUEUE } from '../queue/queue.module';
import { PdfJobPayload } from '../queue/queue.types';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
	private readonly logger = new Logger(InvoicesService.name);

	constructor(
		private readonly prisma: PrismaService,
		@InjectQueue(PDF_QUEUE) private readonly pdfQueue: Queue,
	) {}

	async create(dto: CreateInvoiceDto) {
		const log = await this.prisma.invoiceLog.create({
			data: {
				email: dto.email,
				payload: {
					items: dto.items.map((item) => ({
						description: item.description,
						amount: item.amount,
					})),
				},
				status: 'RECEIVED',
			},
		});

		this.logger.log(`Invoice request logged [id=${log.id}] for ${dto.email}`);

		const client = await this.prisma.client.findUnique({
			where: { email: dto.email },
			include: { company: true },
		});

		if (!client) {
			await this.prisma.invoiceLog.update({
				where: { id: log.id },
				data: { status: 'FAILED' },
			});
			throw new NotFoundException(`Client with email ${dto.email} not found`);
		}

		const invoiceNumber = this.generateInvoiceNumber(log.id);
		const total = dto.items.reduce((sum, item) => sum + item.amount, 0);

		const payload: PdfJobPayload = {
			logId: log.id,
			email: dto.email,
			invoiceNumber,
			issuedAt: new Date().toISOString(),
			items: dto.items,
			total,
			client: {
				firstName: client.firstName,
				lastName: client.lastName,
				email: client.email,
				company: client.company
					? { name: client.company.name, address: client.company.address }
					: null,
			},
		};

		await this.pdfQueue.add('generate-pdf', payload, {
			attempts: 3,
			backoff: { type: 'exponential', delay: 3000 },
		});

		this.logger.log(`PDF job queued for invoice ${invoiceNumber}`);

		return { message: 'Invoice accepted', email: dto.email };
	}

	private generateInvoiceNumber(logId: string): string {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const suffix = logId.slice(0, 8).toUpperCase();
		return `INV-${year}${month}-${suffix}`;
	}
}
