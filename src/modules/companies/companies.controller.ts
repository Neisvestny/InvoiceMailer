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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
	constructor(private readonly companiesService: CompaniesService) {}

	@Post()
	@ApiOperation({ summary: 'Create a company' })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Company created' })
	create(@Body() dto: CreateCompanyDto) {
		return this.companiesService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all companies' })
	findAll() {
		return this.companiesService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get company by id' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
	findOne(@Param('id') id: string) {
		return this.companiesService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update company' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
	update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
		return this.companiesService.update(id, dto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete company' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Company not found' })
	remove(@Param('id') id: string) {
		return this.companiesService.remove(id);
	}
}
