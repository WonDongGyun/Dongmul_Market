import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
	@IsString()
	nickname: string;

	@IsString()
	password: string;

	@IsString()
	address: string;

	@IsEmail()
	email: string;
}
