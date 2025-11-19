import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(['user', 'admin'], { message: 'Role deve ser "user" ou "admin"' })
  role?: string = 'user';
}
