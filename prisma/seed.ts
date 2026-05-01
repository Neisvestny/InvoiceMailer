import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	// Очистка (опционально)
	await prisma.invoiceLog.deleteMany();
	await prisma.company.deleteMany();
	await prisma.client.deleteMany();

	// Создаём клиента + компанию
	const client = await prisma.client.create({
		data: {
			email: 'john.doe@example.com',
			firstName: 'John',
			lastName: 'Doe',
			company: {
				create: {
					name: 'Acme Corp',
					address: 'Somewhere 123',
				},
			},
		},
		include: {
			company: true,
		},
	});

	// Логи инвойсов
	await prisma.invoiceLog.createMany({
		data: [
			{
				email: client.email,
				payload: {
					amount: 100,
					currency: 'USD',
				},
				status: 'RECEIVED',
			},
			{
				email: client.email,
				payload: {
					amount: 100,
					currency: 'USD',
				},
				status: 'SENT',
			},
		],
	});

	console.log('🌱 Seed completed');
}

main()
	.catch((e) => {
		console.error('❌ Seed error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
