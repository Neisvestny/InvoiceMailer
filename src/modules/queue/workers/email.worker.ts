import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { createTransport, Transporter } from 'nodemailer';
import { PrismaService } from '../../database/prisma.service';
import { EMAIL_QUEUE } from '../queue.module';
import { EmailJobPayload } from '../queue.types';

@Processor(EMAIL_QUEUE)
export class EmailWorker extends WorkerHost {
	private readonly logger = new Logger(EmailWorker.name);
	private readonly transporter: Transporter;

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {
		super();
		this.transporter = createTransport({
			host: this.config.get<string>('SMTP_HOST'),
			port: this.config.get<number>('SMTP_PORT'),
			secure: this.config.get<boolean>('SMTP_SECURE'),
			auth: {
				user: this.config.get<string>('SMTP_USER'),
				pass: this.config.get<string>('SMTP_PASS'),
			},
		});
	}

	async process(job: Job<EmailJobPayload>): Promise<void> {
		const { logId, email, invoiceNumber, pdfBase64 } = job.data;

		this.logger.log(`Sending invoice ${invoiceNumber} to ${email}`);

		try {
			await this.transporter.sendMail({
				from: `"${this.config.get('sender.name')}" <${this.config.get('sender.email')}>`,
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
