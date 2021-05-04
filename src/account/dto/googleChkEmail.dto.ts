import { IsEmail, IsString } from 'class-validator';

export class GoogleChkEmailDto {
	@IsEmail()
	readonly email: string;

	@IsString()
	readonly firstName: string;

	@IsString()
	readonly lastName: string;
}