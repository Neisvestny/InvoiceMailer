import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { createTransport } from 'nodemailer';
import { PrismaService } from '../../database/prisma.service';
import { EMAIL_QUEUE } from '../queue.module';
import { EmailJobPayload } from '../queue.types';

@Processor(EMAIL_QUEUE)
export class EmailWorker extends WorkerHost {
	private readonly logger = new Logger(EmailWorker.name);

	private readonly transporter = createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT ?? 587),
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async process(job: Job<EmailJobPayload>): Promise<void> {
		const { logId, email, invoiceNumber, pdfBase64 } = job.data;

		this.logger.log(`Sending invoice ${invoiceNumber} to ${email}`);

		try {
			await this.transporter.sendMail({
				from: `"InvoiceMailer" <${process.env.SMTP_USER}>`,
				to: email,
				subject: `Invoice ${invoiceNumber}`,
				text: `Please find attached your invoice ${invoiceNumber}.`,
				attachments: [
					{
						filename: `${invoiceNumber}.pdf`,
						content: Buffer.from(pdfBase64, 'base64'),
						contentType: 'application/pdf',
					},
				],
			});

			await this.prisma.invoiceLog.update({
				where: { id: logId },
				data: { status: 'SENT' },
			});

			this.logger.log(`Invoice ${invoiceNumber} sent to ${email}`);
		} catch (error) {
			this.logger.error(`Email sending failed for ${invoiceNumber}`, error);
			await this.prisma.invoiceLog.update({
				where: { id: logId },
				data: { status: 'FAILED' },
			});
			throw error;
		}
	}
}
