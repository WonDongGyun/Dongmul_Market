import { IsString } from 'class-validator';

export class RemoveUserDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly itemId: string;

	@IsString()
	readonly icrId: string;
}
