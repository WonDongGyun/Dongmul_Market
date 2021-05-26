import { IsEmail, IsString } from 'class-validator';

export class AddressChange {
	@IsEmail()
	readonly email: string;

	@IsString()
	new_address: string;
}
