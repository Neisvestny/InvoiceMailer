import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
	create(dto: CreateInvoiceDto) {
		// TODO: implement in feat/queue-processing
		return { message: 'Invoice accepted', email: dto.email };
	}
}
