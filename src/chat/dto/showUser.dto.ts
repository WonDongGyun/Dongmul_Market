import { IsString } from 'class-validator';

export class ShowUserDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly icrId: string;

	@IsString()
	readonly dicrId: string;
}
