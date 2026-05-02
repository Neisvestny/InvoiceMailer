import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceDto, InvoiceItemDto } from './dto/create-invoice.dto';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
	let service: InvoicesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [InvoicesService],
		}).compile();

		service = module.get<InvoicesService>(InvoicesService);
	});

	describe('create', () => {
		it('should return accepted message with email', async () => {
			const item = new InvoiceItemDto();
			item.description = 'Logo design';
			item.amount = 150;

			const dto = new CreateInvoiceDto();
			dto.email = 'john.doe@example.com';
			dto.items = [item];

			const result = await service.create(dto);

			expect(result).toEqual({ message: 'Invoice accepted', email: 'john.doe@example.com' });
		});
	});
});
