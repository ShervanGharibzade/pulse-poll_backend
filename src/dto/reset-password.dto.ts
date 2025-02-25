import { IsEmail, IsString } from 'class-validator';

export class RequestResetDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsEmail()
  email: string;
}
