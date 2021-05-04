import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from 'src/entities/code.entity';
import { DealChatRoom } from 'src/entities/dealChatRoom.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { User } from 'src/entities/user.entity';
import { MainPageController } from './main-page.controller';
import { MainPageService } from './main-page.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			SaleItem,
			ItemChatRoom,
			DealChatRoom,
			Code
		])
	],
	controllers: [MainPageController],
	providers: [MainPageService]
})
export class MainPageModule {}
