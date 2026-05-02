import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { InvoiceData, SenderConfig } from '../../types';

const COLORS = {
	primary: '#1a1a2e',
	accent: '#4f46e5',
	muted: '#6b7280',
	border: '#e5e7eb',
	background: '#f9fafb',
	white: '#ffffff',
	text: '#111827',
};

@Injectable()
export class PdfService {
	private readonly logger = new Logger(PdfService.name);
	private readonly sender: SenderConfig;

	constructor(@Inject(ConfigService) private readonly config: ConfigService) {
		this.sender = this.config.get<SenderConfig>('sender')!;
	}

	private calculateHeight(itemCount: number): number {
		const HEADER_H = 200; // шапка + FROM блок
		const DIVIDER_H = 24;
		const BILLING_H = 100; // BILL TO секция
		const TABLE_HEADER_H = 40;
		const ROW_H = 28;
		const TOTAL_H = 70;
		const FOOTER_H = 110;
		const PADDING = 40;

		return (
			HEADER_H +
			DIVIDER_H * 2 +
			BILLING_H +
			TABLE_HEADER_H +
			ROW_H * itemCount +
			TOTAL_H +
			FOOTER_H +
			PADDING
		);
	}

	async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const PAGE_WIDTH = (498 * 72) / 96;
			const PAGE_HEIGHT = this.calculateHeight(data.items.length);

			const doc = new PDFDocument({
				size: [PAGE_WIDTH, PAGE_HEIGHT],
				margins: { top: 20, bottom: 20, left: 20, right: 20 },
			});

			const chunks: Buffer[] = [];
			doc.on('data', (chunk: Buffer) => chunks.push(chunk));
			doc.on('end', () => resolve(Buffer.concat(chunks)));
			doc.on('error', reject);

			this.renderInvoice(doc, data);
			doc.end();
		});
	}

	async saveForPreview(buffer: Buffer, filename: string): Promise<void> {
		if (this.config.get<string>('NODE_ENV') !== 'development') return;

		const fs = await import('fs/promises');
		const path = await import('path');

		const dir = path.resolve(process.cwd(), 'public', 'dev_previews');
		await fs.mkdir(dir, { recursive: true });

		const filePath = path.join(dir, filename);
		await fs.writeFile(filePath, buffer);

		this.logger.log(`PDF preview saved: ${filePath}`);
	}

	private renderInvoice(doc: PDFKit.PDFDocument, data: InvoiceData): void {
		this.renderHeader(doc, data);
		this.renderDivider(doc);
		this.renderBillingSection(doc, data);
		this.renderDivider(doc);
		this.renderItemsTable(doc, data);
		this.renderTotal(doc, data.total);
		this.renderFooter(doc);
		this.logger.log(`PDF rendered for invoice ${data.invoiceNumber}`);
	}

	private renderHeader(doc: PDFKit.PDFDocument, data: InvoiceData): void {
		// Background bar
		doc.rect(0, 0, doc.page.width, 90).fill(COLORS.primary);

		// Company name
		doc.fillColor(COLORS.white)
			.fontSize(26)
			.font('Helvetica-Bold')
			.text(this.sender.brand, 50, 23, { continued: false });

		// Invoice label + number
		doc.fontSize(10)
			.font('Helvetica')
			.fillColor('#a5b4fc')
			.text('INVOICE', doc.page.width - 200, 60, { width: 150, align: 'right' });

		doc.fontSize(12)
			.font('Helvetica-Bold')
			.fillColor(COLORS.white)
			.text(data.invoiceNumber, doc.page.width - 240, 70, { width: 190, align: 'right' });

		doc.moveDown(3);

		// Sender info block
		doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text('FROM', 50, 110);

		doc.fillColor(COLORS.text)
			.fontSize(11)
			.font('Helvetica-Bold')
			.text(this.sender.name, 50, 124)
			.font('Helvetica')
			.fontSize(9)
			.fillColor(COLORS.muted)
			.text(this.sender.address, 50, 140)
			.text(this.sender.city, 50, 153)
			.text(this.sender.email, 50, 166)
			.text(this.sender.phone, 50, 179);

		// Issue date
		const dateStr = data.issuedAt.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

		doc.fillColor(COLORS.muted)
			.fontSize(9)
			.text('ISSUE DATE', doc.page.width - 200, 110, {
				width: 150,
				align: 'right',
			});

		doc.fillColor(COLORS.text)
			.fontSize(11)
			.font('Helvetica-Bold')
			.text(dateStr, doc.page.width - 200, 124, { width: 150, align: 'right' });

		doc.moveDown(5);
	}

	private renderBillingSection(doc: PDFKit.PDFDocument, data: InvoiceData): void {
		doc.moveDown(1);

		const y = doc.y;

		doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text('BILL TO', 50, y);

		const clientName = `${data.client.firstName} ${data.client.lastName}`;
		doc.fillColor(COLORS.text)
			.fontSize(12)
			.font('Helvetica-Bold')
			.text(clientName, 50, y + 14);

		doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted);

		let lineY = y + 30;
		if (data.client.company) {
			doc.text(data.client.company.name, 50, lineY);
			lineY += 13;
			doc.text(data.client.company.address, 50, lineY);
			lineY += 13;
		}
		doc.text(data.client.email, 50, lineY);

		doc.moveDown(1);
	}

	private renderItemsTable(doc: PDFKit.PDFDocument, data: InvoiceData): void {
		const tableTop = doc.y + 8;
		const colDesc = 50;
		const colAmount = doc.page.width - 160;
		const colWidth = colAmount - colDesc;

		// Table header background
		doc.rect(50, tableTop, doc.page.width - 100, 24).fill(COLORS.accent);

		doc.fillColor(COLORS.white)
			.fontSize(9)
			.font('Helvetica-Bold')
			.text('DESCRIPTION', colDesc + 8, tableTop + 8, { width: colWidth - 80 })
			.text('AMOUNT', colAmount, tableTop + 8, { width: 100, align: 'right' });

		let rowY = tableTop + 32;

		data.items.forEach((item, index) => {
			const isEven = index % 2 === 0;
			if (isEven) {
				doc.rect(50, rowY - 4, doc.page.width - 100, 24).fill(COLORS.background);
			}

			doc.fillColor(COLORS.text)
				.fontSize(10)
				.font('Helvetica')
				.text(item.description, colDesc + 8, rowY, { width: colWidth - 80 })
				.text(`$${item.amount.toFixed(2)}`, colAmount, rowY, {
					width: 100,
					align: 'right',
				});

			rowY += 28;
		});

		doc.y = rowY + 4;
	}

	private renderTotal(doc: PDFKit.PDFDocument, total: number): void {
		const y = doc.y + 8;
		const boxWidth = 150;
		const boxX = doc.page.width - 50 - boxWidth;

		// doc.rect(boxX, y, boxWidth, 50).fill(COLORS.primary);

		doc.fillColor(COLORS.accent)
			.fontSize(18)
			.font('Helvetica-Bold')
			.text('TOTAL DUE', boxX + 16, y + 8, {
				width: boxWidth - 32,
				align: 'right',
			});

		doc.fillColor(COLORS.text)
			.fontSize(18)
			.font('Helvetica')
			.text(`$${total.toFixed(2)}`, boxX + 16, y + 30, {
				width: boxWidth - 32,
				align: 'right',
			});

		doc.y = y + 60;
	}

	private renderDivider(doc: PDFKit.PDFDocument): void {
		const y = doc.y + 8;
		doc.moveTo(50, y)
			.lineTo(doc.page.width - 50, y)
			.strokeColor(COLORS.border)
			.lineWidth(1)
			.stroke();
		doc.moveDown(1);
	}

	private renderFooter(doc: PDFKit.PDFDocument): void {
		const FOOTER_H = 110;
		const footerY = doc.page.height - FOOTER_H;
		const W = doc.page.width;

		// Фон
		doc.rect(0, footerY, W, FOOTER_H).fill(COLORS.primary);

		// Акцентная линия сверху
		doc.rect(0, footerY, W, 3).fill(COLORS.accent);

		const contentY = footerY + 14;

		// Левый блок
		doc.fillColor(COLORS.white)
			.fontSize(11)
			.font('Helvetica-Bold')
			.text(this.sender.name, 30, contentY);

		doc.fillColor(COLORS.border)
			.fontSize(7)
			.font('Helvetica')
			.text(this.sender.address, 30, contentY + 14)
			.text(this.sender.city, 30, contentY + 25);

		// Центр
		doc.fillColor('#a5b4fc')
			.fontSize(7)
			.font('Helvetica')
			.text('Payment due within 30 days', W / 2 - 60, contentY + 6, {
				width: 120,
				align: 'center',
			});

		doc.fillColor(COLORS.white)
			.fontSize(8)
			.font('Helvetica-Bold')
			.text('Thank you for your business!', W / 2 - 70, contentY + 19, {
				width: 140,
				align: 'center',
			});

		// Правый блок
		doc.fillColor(COLORS.border)
			.fontSize(7)
			.font('Helvetica')
			.text(this.sender.email, W - 180, contentY + 6, { width: 150, align: 'right' })
			.text(this.sender.phone, W - 180, contentY + 19, { width: 150, align: 'right' });

		// Разделитель перед копирайтом
		doc.moveTo(30, footerY + FOOTER_H - 42)
			.lineTo(W - 30, footerY + FOOTER_H - 42)
			.strokeColor('#2d2d5e')
			.lineWidth(0.5)
			.stroke();

		// Копирайт — прижат к низу
		doc.fillColor(COLORS.white)
			.fontSize(6)
			.font('Helvetica')
			.text(
				`© ${new Date().getFullYear()} ${this.sender.name}. All rights reserved.`,
				30,
				footerY + FOOTER_H - 28,
				{ width: W - 60, align: 'center' },
			);
	}
}
