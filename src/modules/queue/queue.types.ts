// src/modules/queue/queue.types.ts
export interface PdfJobPayload {
	logId: string;
	email: string;
	invoiceNumber: string;
	issuedAt: string; // ISO string — сериализуется в Redis
	items: Array<{ description: string; amount: number }>;
	total: number;
	client: {
		firstName: string;
		lastName: string;
		email: string;
		company: { name: string; address: string } | null;
	};
}

export interface EmailJobPayload {
	logId: string;
	email: string;
	invoiceNumber: string;
	pdfBase64: string; // Buffer не сериализуется в Redis
}
