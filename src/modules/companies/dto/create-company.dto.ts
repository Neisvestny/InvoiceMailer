import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateClientDto } from '../../clients/dto/create-client.dto';

export class CreateCompanyDto {
	@ApiProperty({ example: 'Acme Corp' })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ example: 'Somewhere 123' })
	@IsString()
	@IsNotEmpty()
	address!: string;

	@ApiProperty({ type: [CreateClientDto], required: false })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateClientDto)
	clients?: CreateClientDto[];
}
