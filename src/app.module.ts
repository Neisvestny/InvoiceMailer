import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/database/prisma.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { QueueWorkersModule } from './modules/queue/queue-workers.module';
import { QueueModule } from './modules/queue/queue.module';

@Module({
	imports: [PrismaModule, QueueModule, QueueWorkersModule, InvoicesModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
