import { IsEmail, IsNumber } from 'class-validator';

export class ChkNumdto {
	@IsEmail()
	email: string;

	@IsNumber()
	authchkNum: number;
}
