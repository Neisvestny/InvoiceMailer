export enum InvoiceLogStatus {
	RECEIVED = 'RECEIVED',
	PDF_GENERATION_STARTED = 'PDF_GENERATION_STARTED',
	PDF_GENERATED = 'PDF_GENERATED',
	PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
	EMAIL_SENDING_STARTED = 'EMAIL_SENDING_STARTED',
	SENT = 'SENT',
	FAILED = 'FAILED',
}

export const INVOICE_STATUS_DESCRIPTIONS: Record<InvoiceLogStatus, string> = {
	[InvoiceLogStatus.RECEIVED]: 'Invoice request received',
	[InvoiceLogStatus.PDF_GENERATION_STARTED]: 'PDF generation started',
	[InvoiceLogStatus.PDF_GENERATED]: 'PDF generated successfully',
	[InvoiceLogStatus.PDF_GENERATION_FAILED]: 'PDF generation failed',
	[InvoiceLogStatus.EMAIL_SENDING_STARTED]: 'Email sending started',
	[InvoiceLogStatus.SENT]: 'Email sent successfully',
	[InvoiceLogStatus.FAILED]: 'Final delivery failed',
};
