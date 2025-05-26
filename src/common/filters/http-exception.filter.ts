import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException) 
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception instanceof HttpException? exception.message:'Internal server error'

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    };

    response.status(status).json(responseBody);
  }
}
