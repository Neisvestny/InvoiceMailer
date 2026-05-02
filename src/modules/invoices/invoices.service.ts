import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
	private readonly logger = new Logger(InvoicesService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly pdfService: PdfService,
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
		const issuedAt = new Date();
		const total = dto.items.reduce((sum, item) => sum + item.amount, 0);

		this.logger.log(`Invoice number generated: ${invoiceNumber}`);

		const pdfBuffer = await this.pdfService.generateInvoicePdf({
			invoiceNumber,
			issuedAt,
			client: {
				firstName: client.firstName,
				lastName: client.lastName,
				email: client.email,
				company: client.company
					? { name: client.company.name, address: client.company.address }
					: null,
			},
			items: dto.items,
			total,
		});

		await this.pdfService.saveForPreview(pdfBuffer, `${invoiceNumber}.pdf`);

		await this.prisma.invoiceLog.update({
			where: { id: log.id },
			data: { status: 'PDF_GENERATED' },
		});

		this.logger.log(`PDF generated for invoice ${invoiceNumber} [${pdfBuffer.length} bytes]`);

		return {
			invoiceNumber,
			client,
			items: dto.items,
			total,
			issuedAt,
			logId: log.id,
			pdfBuffer,
		};
	}

	private generateInvoiceNumber(logId: string): string {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const suffix = logId.slice(0, 8).toUpperCase();
		return `INV-${year}${month}-${suffix}`;
	}
}
