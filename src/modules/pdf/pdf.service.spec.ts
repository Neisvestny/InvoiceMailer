import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceData } from '../../types';
import { PdfService } from './pdf.service';

const mockInvoiceData: InvoiceData = {
	invoiceNumber: 'INV-202505-ABCDEF12',
	issuedAt: new Date('2025-05-01T00:00:00.000Z'),
	client: {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com',
		company: {
			name: 'Acme Corp',
			address: 'Somewhere 123',
		},
	},
	items: [
		{ description: 'Logo design', amount: 150 },
		{ description: 'Landing page', amount: 300 },
	],
	total: 450,
};

describe('PdfService', () => {
	let service: PdfService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PdfService,
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn().mockImplementation((key: string) => {
							if (key === 'sender') {
								return {
									brand: 'Test Brand',
									name: 'Test Sender',
									address: 'Test Address 123',
									city: 'Test City',
									email: 'test@example.com',
									phone: '+123456789',
								};
							}
							if (key === 'NODE_ENV') {
								return 'test';
							}
							return null;
						}),
					},
				},
			],
		}).compile();

		service = module.get<PdfService>(PdfService);
	});

	describe('generateInvoicePdf', () => {
		it('should return a Buffer', async () => {
			const result = await service.generateInvoicePdf(mockInvoiceData);
			expect(result).toBeInstanceOf(Buffer);
		});

		it('should return a non-empty Buffer', async () => {
			const result = await service.generateInvoicePdf(mockInvoiceData);
			expect(result.length).toBeGreaterThan(0);
		});

		it('should return a valid PDF (starts with %PDF header)', async () => {
			const result = await service.generateInvoicePdf(mockInvoiceData);
			const header = result.slice(0, 4).toString('ascii');
			expect(header).toBe('%PDF');
		});

		it('should handle client without a company', async () => {
			const dataWithoutCompany: InvoiceData = {
				...mockInvoiceData,
				client: {
					...mockInvoiceData.client,
					company: null,
				},
			};

			const result = await service.generateInvoicePdf(dataWithoutCompany);
			expect(result).toBeInstanceOf(Buffer);
			expect(result.length).toBeGreaterThan(0);
		});

		it('should handle a single item', async () => {
			const singleItemData: InvoiceData = {
				...mockInvoiceData,
				items: [{ description: 'Consulting', amount: 500 }],
				total: 500,
			};

			const result = await service.generateInvoicePdf(singleItemData);
			expect(result).toBeInstanceOf(Buffer);
		});

		it('should handle many items without crashing', async () => {
			const manyItems = Array.from({ length: 20 }, (_, i) => ({
				description: `Service item ${i + 1}`,
				amount: 100,
			}));

			const result = await service.generateInvoicePdf({
				...mockInvoiceData,
				items: manyItems,
				total: 2000,
			});

			expect(result).toBeInstanceOf(Buffer);
			expect(result.length).toBeGreaterThan(0);
		});
	});
});
