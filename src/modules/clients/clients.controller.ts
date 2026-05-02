import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a client' })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Client created' })
	create(@Body() dto: CreateClientDto) {
		return this.clientsService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all clients' })
	findAll() {
		return this.clientsService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get client by id' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Client not found' })
	findOne(@Param('id') id: string) {
		return this.clientsService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update client' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Client not found' })
	update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
		return this.clientsService.update(id, dto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete client' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Client not found' })
	remove(@Param('id') id: string) {
		return this.clientsService.remove(id);
	}
}
