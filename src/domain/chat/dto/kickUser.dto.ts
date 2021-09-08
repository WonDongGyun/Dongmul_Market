import { IsEmail, IsString } from 'class-validator';

export class KickUserDto {
	@IsEmail()
	readonly email: string;

	@IsString()
	readonly itemId: string;

	@IsString()
	readonly icrId: string;
}
