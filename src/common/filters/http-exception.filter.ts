import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type HttpExceptionResponse =
	| string
	| {
			message?: string | string[];
			error?: string;
			statusCode?: number;
	  };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const message =
			exception instanceof HttpException
				? this.extractMessage(exception)
				: 'Internal server error';

		if (status >= 500) {
			this.logger.error(
				`${request.method} ${request.url} → ${status}`,
				this.serializeError(exception),
			);
		} else {
			this.logger.warn(`${request.method} ${request.url} → ${status}`);
		}

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message,
		});
	}

	private extractMessage(exception: HttpException): string | string[] {
		const response: unknown = exception.getResponse();

		if (typeof response === 'string') {
			return response;
		}

		if (this.isHttpExceptionResponse(response)) {
			return response.message ?? 'Unknown error';
		}

		return 'Unknown error';
	}

	private isHttpExceptionResponse(
		response: unknown,
	): response is Exclude<HttpExceptionResponse, string> {
		return typeof response === 'object' && response !== null;
	}

	private serializeError(exception: unknown): object {
		if (exception instanceof HttpException) {
			return {};
		}

		if (exception instanceof Error) {
			return {
				name: exception.name,
				message: this.sanitizePII(exception.message),
				stack: exception.stack
					?.split('\n')
					.slice(0, 5)
					.map((line) => line.trim())
					.join(' | '),
			};
		}

		return {
			type: typeof exception,
			value: this.sanitizePII(String(exception)),
		};
	}

	/**
	 * Removes potentially sensitive data from an error message
	 * - Email addresses
	 * - IP addresses
	 * - API keys / tokens
	 * - File system paths (in some cases)
	 */
	private sanitizePII(input: string): string {
		return (
			input
				// Email addresses: user@example.com → [EMAIL]
				.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
				// IP addresses: 192.168.1.1 → [IP]
				.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP]')
				// API keys / tokens (starting with sk_, pk_, etc.) → [TOKEN]
				.replace(/\b[a-z]{2}_[a-zA-Z0-9]{20,}\b/g, '[TOKEN]')
				// Bearer tokens → [BEARER]
				.replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [TOKEN]')
		);
	}
}
