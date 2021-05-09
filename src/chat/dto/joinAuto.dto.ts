import { IsString } from 'class-validator';

export class JoinAutoDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly icrId: string;

	@IsString()
	readonly dicrId: string;
}
