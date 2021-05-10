import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Column } from 'typeorm';


export class PasswordChangeDto {

	@IsNotEmpty()

	readonly password: string;
}