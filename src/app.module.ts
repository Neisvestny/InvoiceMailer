import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/database/prisma.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
	imports: [PrismaModule, InvoicesModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
