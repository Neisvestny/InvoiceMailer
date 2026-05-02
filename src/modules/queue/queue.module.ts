import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const PDF_QUEUE = 'pdf-queue';
export const EMAIL_QUEUE = 'email-queue';

@Global()
@Module({
	imports: [
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				connection: {
					host: config.get<string>('REDIS_HOST'),
					port: config.get<number>('REDIS_PORT'),
				},
			}),
		}),
		BullModule.registerQueue({ name: PDF_QUEUE }, { name: EMAIL_QUEUE }),
	],
	exports: [BullModule],
})
export class QueueModule {}
