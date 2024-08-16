import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  username: string;

  @IsOptional()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  name: string
}
