// src/modules/queue/queue.module.ts
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

export const PDF_QUEUE = 'pdf-queue';
export const EMAIL_QUEUE = 'email-queue';

@Global()
@Module({
	imports: [
		BullModule.forRoot({
			connection: {
				host: process.env.REDIS_HOST ?? 'localhost',
				port: Number(process.env.REDIS_PORT ?? 6379),
			},
		}),
		BullModule.registerQueue({ name: PDF_QUEUE }, { name: EMAIL_QUEUE }),
	],
	exports: [BullModule],
})
export class QueueModule {}
