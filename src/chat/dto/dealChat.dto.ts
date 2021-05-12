import { IsString } from 'class-validator';

export class DealChatDto {
	@IsString()
	readonly email: string;

	@IsString()
	readonly dicrId: string;

	@IsString()
	readonly chatMsg: string;
}
