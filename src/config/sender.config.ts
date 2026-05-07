import { registerAs } from '@nestjs/config';

export const senderConfig = registerAs('sender', () => {
	return {
		brand: process.env.SENDER_BRAND,
		name: process.env.SENDER_NAME,
		address: process.env.SENDER_ADDRESS,
		city: process.env.SENDER_CITY,
		email: process.env.SENDER_EMAIL,
		phone: process.env.SENDER_PHONE,
	};
});

export interface SenderConfig {
	brand: string;
	name: string;
	address: string;
	city: string;
	email: string;
	phone: string;
}
