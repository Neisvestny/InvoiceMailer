import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { PdfService } from '../../pdf/pdf.service';
import { EMAIL_QUEUE, PDF_QUEUE } from '../queue.module';
import { EmailJobPayload, PdfJobPayload } from '../queue.types';

@Processor(PDF_QUEUE)
export class PdfWorker extends WorkerHost {
	private readonly logger = new Logger(PdfWorker.name);

	constructor(
		private readonly pdfService: PdfService,
		private readonly prisma: PrismaService,
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
	) {
		super();
	}

	async process(job: Job<PdfJobPayload>): Promise<void> {
		const { logId, email, invoiceNumber, issuedAt, items, total, client } = job.data;

		this.logger.log(`Processing PDF job for invoice ${invoiceNumber}`);

		try {
			const pdfBuffer = await this.pdfService.generateInvoicePdf({
				invoiceNumber,
				issuedAt: new Date(issuedAt),
				client,
				items,
				total,
			});

			await this.pdfService.saveForPreview(pdfBuffer, `${invoiceNumber}.pdf`);

			await this.prisma.invoiceLog.update({
				where: { id: logId },
				data: { status: 'PDF_GENERATED' },
			});

			this.logger.log(`PDF generated for ${invoiceNumber} [${pdfBuffer.length} bytes]`);

			const emailPayload: EmailJobPayload = {
				logId,
				email,
				invoiceNumber,
				pdfBase64: pdfBuffer.toString('base64'),
			};

			await this.emailQueue.add('send-email', emailPayload, {
				attempts: 3,
				backoff: { type: 'exponential', delay: 5000 },
			});
		} catch (error) {
			this.logger.error(`PDF generation failed for ${invoiceNumber}`, error);
			await this.prisma.invoiceLog.update({
				where: { id: logId },
				data: { status: 'FAILED' },
			});
			throw error;
		}
	}
}
