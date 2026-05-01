import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableShutdownHooks();

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
	console.error('Failed to start app', err);
	process.exit(1);
});
