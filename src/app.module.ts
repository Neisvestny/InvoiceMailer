import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { senderConfig } from './config/sender.config';
import { ClientsModule } from './modules/clients/clients.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { PrismaModule } from './modules/database/prisma.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { QueueWorkersModule } from './modules/queue/queue-workers.module';
import { QueueModule } from './modules/queue/queue.module';
import { SenderModule } from './modules/sender/sender.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [senderConfig],
			validationSchema: envValidationSchema,
			validationOptions: {
				abortEarly: true,
			},
		}),
		PrismaModule,
		QueueModule,
		QueueWorkersModule,
		InvoicesModule,
		ClientsModule,
		CompaniesModule,
		SenderModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
