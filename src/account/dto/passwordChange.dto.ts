import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { Column } from 'typeorm';


export class PasswordChangeDto {
@IsEmail(
	
)
	readonly email : string

	@IsString()
	readonly password: string;
}