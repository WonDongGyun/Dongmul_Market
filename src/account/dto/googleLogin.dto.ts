import { IsEmail } from 'class-validator';

export class GoogleLoginDto {
	@IsEmail()
	readonly email: string;
}
