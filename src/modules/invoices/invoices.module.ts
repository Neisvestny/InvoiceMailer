import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { PdfModule } from '../pdf/pdf.module';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
	imports: [PrismaModule, PdfModule],
	controllers: [InvoicesController],
	providers: [InvoicesService],
})
export class InvoicesModule {}
