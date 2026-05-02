import * as path from 'path';
import * as dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config({
	path: path.resolve(process.cwd(), '.env'),
});

export default defineConfig({
	schema: './schema.prisma',
	migrations: {
		path: './migrations',
		seed: 'tsx prisma/seed.ts',
	},
	datasource: {
		url: env('DATABASE_URL'),
	},
});
