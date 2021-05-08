import { IsString } from 'class-validator';

export class ItemChatDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly icrId: string;

	@IsString()
	readonly chatMsg: string;
}
