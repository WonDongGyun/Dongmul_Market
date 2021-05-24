import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from 'src/entities/code.entity';
import { User } from 'src/entities/user.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { MainPageController } from './main-page.controller';
import { MainPageService } from './main-page.service';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { KickUser } from 'src/entities/kickUser.entity';
import { MessageService } from 'src/message/message.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			SaleItem,
			ItemChatRoom,
			ItemChatRoomUser,
			ItemChatRoomUserMsg,
			Code,
			EmailAuth,
			KickUser
		])
	],
	controllers: [MainPageController],
	providers: [MainPageService, MessageService]
})
export class MainPageModule {}
