import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.invoiceLog.deleteMany();
	await prisma.client.deleteMany();
	await prisma.company.deleteMany();

	const company = await prisma.company.create({
		data: {
			name: 'Acme Corp',
			address: 'Somewhere 123',
		},
	});

	await prisma.client.create({
		data: {
			email: 'john.doe@example.com',
			firstName: 'John',
			lastName: 'Doe',
			companyId: company.id,
		},
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
