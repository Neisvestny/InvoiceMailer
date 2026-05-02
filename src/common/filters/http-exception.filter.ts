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

		this.logger.error(`${request.method} ${request.url} → ${status}`);

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
}
