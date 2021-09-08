import { IsString } from 'class-validator';

export class DeleteButtonDto {
	@IsString()
	readonly itemId: string;

	@IsString()
	readonly icrId: string;
}
