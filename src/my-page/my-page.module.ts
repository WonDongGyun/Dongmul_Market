import { Module } from '@nestjs/common';
import { MyPageService } from './my-page.service';
import { MyPageController } from './my-page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { DealChatRoom } from 'src/entities/dealChatRoom.entity';
import { DealChatRoomUser } from 'src/entities/dealChatRoomUser.entity';
import { DealChatRoomUserMsg } from 'src/entities/dealChatRoomUserMsg.entity';
import { Code } from 'src/entities/code.entity';
import { EmailAuth } from 'src/entities/emailAuth.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			SaleItem,
			ItemChatRoom,
			ItemChatRoomUser,
			ItemChatRoomUserMsg,
			DealChatRoom,
			DealChatRoomUser,
			DealChatRoomUserMsg,
			Code,
			EmailAuth
		])
	],
	controllers: [MyPageController],
	providers: [MyPageService]
})
export class MyPageModule {}
