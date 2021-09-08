import { IsEmail, IsString } from 'class-validator';

export class KakaoChkEmailDto {
	@IsEmail()
	readonly email: string;

	@IsString()
	readonly nickname: string;
}
