import { IsEmail } from 'class-validator';

export class KakaoLoginDto {
	@IsEmail()
	readonly email: string;
}
