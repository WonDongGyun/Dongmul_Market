import { IsString } from 'class-validator';

export class ItemChatOneJoinDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly dicrId: string;
}
