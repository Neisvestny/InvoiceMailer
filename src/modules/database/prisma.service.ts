import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	private readonly logger = new Logger(PrismaService.name);

	constructor(@Inject(ConfigService) config: ConfigService) {
		const adapter = new PrismaPg({
			connectionString: config.get<string>('DATABASE_URL'),
		});
		super({ adapter });
	}

	async onModuleInit() {
		try {
			await this.$connect();
			this.logger.log('✅ Database connected successfully');
		} catch (error) {
			this.logger.error('❌ Database connection failed', error);
			throw error;
		}
	}

	async onModuleDestroy() {
		await this.$disconnect();
		this.logger.warn('🔌 Database disconnected');
	}
}
