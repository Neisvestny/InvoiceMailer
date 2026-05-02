import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClientDto {
	@ApiProperty({ example: 'john.doe@example.com' })
	@IsEmail()
	email!: string;

	@ApiProperty({ example: 'John' })
	@IsString()
	@IsNotEmpty()
	firstName!: string;

	@ApiProperty({ example: 'Doe' })
	@IsString()
	@IsNotEmpty()
	lastName!: string;

	@ApiPropertyOptional({ example: 'uuid-of-company' })
	@IsUUID()
	@IsOptional()
	companyId?: string;
}
