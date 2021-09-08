import { IsEmail, IsNumber } from 'class-validator';

export class EmailAuthDto {
	@IsEmail()
	readonly email: string;

	@IsNumber()
	readonly authchkNum: number;
}
