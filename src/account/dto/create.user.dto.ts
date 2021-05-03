import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
	@Length(8)
	nickname: string;
	@Length(8)
	password: string;
	// @Length(8)
	// retypedPassword: string;
	@IsString()
	address:string
	
    

	@IsEmail()
	email: string;
}
