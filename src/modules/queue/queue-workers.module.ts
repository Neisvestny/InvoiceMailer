import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PdfModule } from '../pdf/pdf.module';
import { EMAIL_QUEUE, PDF_QUEUE } from './queue.module';
import { EmailWorker } from './workers/email.worker';
import { PdfWorker } from './workers/pdf.worker';

@Module({
	imports: [BullModule.registerQueue({ name: PDF_QUEUE }, { name: EMAIL_QUEUE }), PdfModule],
	providers: [PdfWorker, EmailWorker],
})
export class QueueWorkersModule {}
