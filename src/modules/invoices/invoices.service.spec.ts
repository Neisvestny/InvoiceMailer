import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { PDF_QUEUE } from '../queue/queue.module';
import { CreateInvoiceDto, InvoiceItemDto } from './dto/create-invoice.dto';
import { InvoicesService } from './invoices.service';

const mockClient = {
	id: 'client-uuid',
	email: 'john.doe@example.com',
	firstName: 'John',
	lastName: 'Doe',
	createdAt: new Date(),
	company: {
		id: 'company-uuid',
		name: 'Acme Corp',
		address: 'Somewhere 123',
		clientId: 'client-uuid',
		createdAt: new Date(),
	},
};

const mockLog = {
	id: 'abcdef12-0000-0000-0000-000000000000',
	email: 'john.doe@example.com',
	payload: {},
	status: 'RECEIVED',
	createdAt: new Date(),
};

const mockPrisma = {
	invoiceLog: {
		create: jest.fn(),
		update: jest.fn(),
	},
	client: {
		findUnique: jest.fn(),
	},
};

const mockPdfQueue = {
	add: jest.fn(),
};

describe('InvoicesService', () => {
	let service: InvoicesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InvoicesService,
				{ provide: PrismaService, useValue: mockPrisma },
				{ provide: getQueueToken(PDF_QUEUE), useValue: mockPdfQueue },
			],
		}).compile();

		service = module.get<InvoicesService>(InvoicesService);
	});

	afterEach(() => jest.clearAllMocks());

	const makeDto = (): CreateInvoiceDto => {
		const item = new InvoiceItemDto();
		item.description = 'Logo design';
		item.amount = 150;

		const dto = new CreateInvoiceDto();
		dto.email = 'john.doe@example.com';
		dto.items = [item];
		return dto;
	};

	describe('create', () => {
		it('should log request, fetch client, enqueue PDF job and return accepted message', async () => {
			mockPrisma.invoiceLog.create.mockResolvedValue(mockLog);
			mockPrisma.client.findUnique.mockResolvedValue(mockClient);
			mockPdfQueue.add.mockResolvedValue({ id: 'job-1' });

			const result = await service.create(makeDto());

			expect(mockPrisma.invoiceLog.create).toHaveBeenCalledWith({
				data: {
					email: 'john.doe@example.com',
					payload: { items: [{ description: 'Logo design', amount: 150 }] },
					status: 'RECEIVED',
				},
			});

			expect(mockPrisma.client.findUnique).toHaveBeenCalledWith({
				where: { email: 'john.doe@example.com' },
				include: { company: true },
			});

			expect(mockPdfQueue.add).toHaveBeenCalledWith(
				'generate-pdf',
				expect.objectContaining({
					logId: mockLog.id,
					email: 'john.doe@example.com',
					invoiceNumber: expect.stringMatching(/^INV-\d{6}-[A-F0-9]{8}$/) as string,
					total: 150,
				}),
				expect.any(Object),
			);

			expect(result).toEqual({ message: 'Invoice accepted', email: 'john.doe@example.com' });
		});

		it('should mark log as FAILED and throw NotFoundException when client not found', async () => {
			mockPrisma.invoiceLog.create.mockResolvedValue(mockLog);
			mockPrisma.client.findUnique.mockResolvedValue(null);

			await expect(service.create(makeDto())).rejects.toThrow(NotFoundException);

			expect(mockPrisma.invoiceLog.update).toHaveBeenCalledWith({
				where: { id: mockLog.id },
				data: { status: 'FAILED' },
			});

			expect(mockPdfQueue.add).not.toHaveBeenCalled();
		});

		it('should correctly sum multiple items in job payload', async () => {
			mockPrisma.invoiceLog.create.mockResolvedValue(mockLog);
			mockPrisma.client.findUnique.mockResolvedValue(mockClient);
			mockPdfQueue.add.mockResolvedValue({ id: 'job-2' });

			const item2 = new InvoiceItemDto();
			item2.description = 'Landing page';
			item2.amount = 300;

			const dto = makeDto();
			dto.items.push(item2);

			await service.create(dto);

			expect(mockPdfQueue.add).toHaveBeenCalledWith(
				'generate-pdf',
				expect.objectContaining({ total: 450 }),
				expect.any(Object),
			);
		});
	});
});
