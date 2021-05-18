import { IsEmail, IsString } from 'class-validator';

export class ExchangeDto {
	@IsEmail()
	readonly email: string;

	@IsEmail()
	readonly consumerEmail: string;

	@IsString()
	readonly itemId: string;

	@IsString()
	readonly icrId: string;
}
