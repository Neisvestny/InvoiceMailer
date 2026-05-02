import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
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
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => InvoiceItemDto)
	items!: InvoiceItemDto[];
}
