import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import puppeteer, { type Browser, type Page } from 'puppeteer';
import { InvoiceData, SenderConfig } from './types';

@Injectable()
export class PdfService {
	private readonly logger = new Logger(PdfService.name);
	private readonly sender: SenderConfig;

	constructor(private readonly configService: ConfigService) {
		const sender = this.configService.get<SenderConfig>('sender');

		if (!sender) {
			throw new Error('Sender config not loaded');
		}

		this.sender = sender;
	}

	async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
		const html = await this.renderTemplate(data);
		return this.htmlToPdf(html, data.invoiceNumber);
	}

	async saveForPreview(buffer: Buffer, filename: string): Promise<void> {
		if (this.configService.get<string>('NODE_ENV') !== 'development') return;

		const fs = await import('fs/promises');

		const dir = path.resolve(process.cwd(), 'public', 'dev_previews');
		await fs.mkdir(dir, { recursive: true });

		const filePath = path.join(dir, filename);
		await fs.writeFile(filePath, buffer);

		this.logger.log(`PDF preview saved: ${filePath}`);
	}

	private renderTemplate(data: InvoiceData): Promise<string> {
		const templatePath = path.resolve(
			process.cwd(),
			'src',
			'modules',
			'pdf',
			'templates',
			'invoice.ejs',
		);

		const dateStr = data.issuedAt.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		return ejs.renderFile(templatePath, { sender: this.sender, data, dateStr });
	}

	private async htmlToPdf(html: string, invoiceNumber: string): Promise<Buffer> {
		const browser: Browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		try {
			const page: Page = await browser.newPage();
			await page.setContent(html, { waitUntil: 'networkidle0' });

			const pdf = await page.pdf({
				width: '519px',
				printBackground: true,
				margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
			});

			this.logger.log(`PDF rendered for invoice ${invoiceNumber}`);

			return Buffer.from(pdf);
		} finally {
			await browser.close();
		}
	}
}
