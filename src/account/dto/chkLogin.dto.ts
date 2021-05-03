import { IsEmail, IsString } from 'class-validator';

export class ChkLoginDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}
