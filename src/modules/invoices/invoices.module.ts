import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { PDF_QUEUE } from '../queue/queue.module';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
	imports: [PrismaModule, BullModule.registerQueue({ name: PDF_QUEUE })],
	controllers: [InvoicesController],
	providers: [InvoicesService],
})
export class InvoicesModule {}
