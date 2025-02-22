import { IsString, IsNotEmpty } from 'class-validator';
import { IsUnique } from 'src/custom-validator/custom_validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsUnique({
    tableName: 'user',
    column: 'username',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsUnique({
    tableName: 'user',
    column: 'email',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
