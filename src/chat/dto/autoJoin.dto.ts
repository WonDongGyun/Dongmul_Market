import { IsEmail, IsString } from 'class-validator';

export class AutoJoinDto {
	@IsEmail()
	email: string;

	@IsString()
	icrId: string;
}
