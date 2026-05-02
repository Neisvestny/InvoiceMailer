import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
	constructor(private readonly invoicesService: InvoicesService) {}

	@Post()
	@HttpCode(HttpStatus.ACCEPTED)
	@ApiOperation({ summary: 'Submit an invoice request' })
	@ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Invoice accepted for processing' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Client not found' })
	create(@Body() dto: CreateInvoiceDto) {
		return this.invoicesService.create(dto);
	}
}
