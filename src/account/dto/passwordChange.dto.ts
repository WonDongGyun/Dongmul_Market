
import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';



export class PasswordChangeDto {
	@IsEmail()
	readonly email: string;
	@IsNumber()
	readonly passwordchkNum: number;
	@IsString()
	readonly newpassword: string;
}