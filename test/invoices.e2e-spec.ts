import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('InvoicesController (e2e)', () => {
	let app: INestApplication<App>;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			}),
		);
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	describe('POST /invoices', () => {
		it('should return 202 for valid payload', () => {
			return request(app.getHttpServer())
				.post('/invoices')
				.send({
					email: 'john.doe@example.com',
					items: [{ description: 'Logo design', amount: 150 }],
				})
				.expect(202)
				.expect({ message: 'Invoice accepted', email: 'john.doe@example.com' });
		});

		it('should return 400 for invalid email', () => {
			return request(app.getHttpServer())
				.post('/invoices')
				.send({
					email: 'not-an-email',
					items: [{ description: 'Logo design', amount: 150 }],
				})
				.expect(400);
		});

		it('should return 400 for empty items array', () => {
			return request(app.getHttpServer())
				.post('/invoices')
				.send({
					email: 'john.doe@example.com',
					items: [],
				})
				.expect(400);
		});

		it('should return 400 for negative amount', () => {
			return request(app.getHttpServer())
				.post('/invoices')
				.send({
					email: 'john.doe@example.com',
					items: [{ description: 'Logo design', amount: -50 }],
				})
				.expect(400);
		});

		it('should return 400 for missing fields', () => {
			return request(app.getHttpServer()).post('/invoices').send({}).expect(400);
		});
	});
});
