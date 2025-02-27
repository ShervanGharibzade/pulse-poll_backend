// token-validation.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class TokenValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception.getStatus();
    const message = exception.getResponse();

    if (status === HttpStatus.UNAUTHORIZED && message === 'Invalid token') {
      response.status(status).json({
        isUserTokenValid: false,
      });
    } else {
      response.status(status).json(message);
    }
  }
}
