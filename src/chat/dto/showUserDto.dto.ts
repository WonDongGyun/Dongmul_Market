import { IsString } from 'class-validator';

export class ShowUserDto {
	@IsString()
	readonly icrId: string;

	@IsString()
	readonly email: string;
}
