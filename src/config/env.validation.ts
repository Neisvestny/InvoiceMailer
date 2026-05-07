import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
	NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
	PORT: Joi.number().default(3000),

	DATABASE_URL: Joi.string().required(),

	REDIS_HOST: Joi.string().default('localhost'),
	REDIS_PORT: Joi.number().default(6379),

	SMTP_HOST: Joi.string().required(),
	SMTP_PORT: Joi.number().required(),
	SMTP_SECURE: Joi.boolean().default(false),
	SMTP_USER: Joi.string().required(),
	SMTP_PASS: Joi.string().required(),

	SENDER_BRAND: Joi.string().required(),
	SENDER_NAME: Joi.string().required(),
	SENDER_ADDRESS: Joi.string().required(),
	SENDER_CITY: Joi.string().required(),
	SENDER_EMAIL: Joi.string().email().required(),
	SENDER_PHONE: Joi.string().required(),
});
