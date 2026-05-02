import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceDto, InvoiceItemDto } from './dto/create-invoice.dto';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

describe('InvoicesController', () => {
	let controller: InvoicesController;
	let service: InvoicesService;

	const mockService = {
		create: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [InvoicesController],
			providers: [{ provide: InvoicesService, useValue: mockService }],
		}).compile();

		controller = module.get<InvoicesController>(InvoicesController);
		service = module.get<InvoicesService>(InvoicesService);
	});

	afterEach(() => jest.clearAllMocks());

	describe('create', () => {
		it('should call service.create with dto and return result', async () => {
			const item = new InvoiceItemDto();
			item.description = 'Logo design';
			item.amount = 150;

			const dto = new CreateInvoiceDto();
			dto.email = 'john.doe@example.com';
			dto.items = [item];

			const result = { message: 'Invoice accepted', email: dto.email };
			mockService.create.mockResolvedValue(result);

			expect(await controller.create(dto)).toBe(result);
			expect(service.create).toHaveBeenCalledWith(dto);
		});
	});
});
