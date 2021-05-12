import { IsEmail, IsString } from 'class-validator';

export class AddressChange {
	@IsEmail()
	readonly email: string;

	// @IsString()
	// readonly address: string;

    @IsString()
    readonly new_address: string
}