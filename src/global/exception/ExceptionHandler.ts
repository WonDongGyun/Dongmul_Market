import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class ExceptionHandler implements ExceptionFilter {
	// QueryFailedError
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		response.status(status).json({
			statusCode: status,
			message: exception.message,
			path: request.url
		});
		// throw new Error('Method not implemented.');
	}
}
