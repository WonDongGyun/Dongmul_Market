import { IsString } from 'class-validator';

export class ItemChatJoinDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly icrId: string;
}
