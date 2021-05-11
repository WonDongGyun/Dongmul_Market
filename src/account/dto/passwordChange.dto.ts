
import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';
import { Column } from 'typeorm';


export class PasswordChangeDto {
	@IsEmail()
	readonly email: string;
	@IsNumber()
	readonly passwordchkNum: number;
	@IsString()
	readonly newpassword: string;
}