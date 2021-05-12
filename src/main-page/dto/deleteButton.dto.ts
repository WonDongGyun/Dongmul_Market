import { IsString } from 'class-validator';


export class DeleteButtonDto {
	@IsString()
	itemId: string;
}