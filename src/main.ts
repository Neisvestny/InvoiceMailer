import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const config = new DocumentBuilder()
		.setTitle('InvoiceMailer API')
		.setDescription('API for generating and sending invoices via email')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	app.enableShutdownHooks();

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
	console.error('Failed to start app', err);
	process.exit(1);
});
