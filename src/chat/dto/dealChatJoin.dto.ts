import { IsString } from 'class-validator';

export class DealChatJoinDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly dicrId: string;
}
