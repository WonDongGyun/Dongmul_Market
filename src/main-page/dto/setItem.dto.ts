import { IsDate, IsString } from 'class-validator';

export class SetItemDto {
	@IsString()
	readonly title: string;

	@IsString()
	readonly category: string;

	@IsString()
	readonly wantItem: string;

	@IsString()
	readonly comment: string;

	@IsString()
	readonly deadLine: Date;
}
