import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsNumber,
	IsPositive,
	IsString,
	ValidateNested,
} from 'class-validator';

export class InvoiceItemDto {
	@ApiProperty({ example: 'Logo design' })
	@IsString()
	@IsNotEmpty()
	description!: string;

	@ApiProperty({ example: 150 })
	@IsNumber()
	@IsPositive()
	amount!: number;
}

export class CreateInvoiceDto {
	@ApiProperty({ example: 'john.doe@example.com' })
	@IsEmail()
	email!: string;

	@ApiProperty({ type: [InvoiceItemDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => InvoiceItemDto)
	items!: InvoiceItemDto[];
}
