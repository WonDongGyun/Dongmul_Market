import { IsEmail } from 'class-validator';

export class ChkEmailDto {
	@IsEmail()
	email: string;
}
