export interface InvoiceData {
	invoiceNumber: string;
	issuedAt: Date;
	client: {
		firstName: string;
		lastName: string;
		email: string;
		company: {
			name: string;
			address: string;
		} | null;
	};
	items: Array<{ description: string; amount: number }>;
	total: number;
}

export interface SenderConfig {
	brand: string;
	name: string;
	address: string;
	city: string;
	email: string;
	phone: string;
}
