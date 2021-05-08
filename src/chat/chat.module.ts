import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from 'src/entities/code.entity';
import { DealChatRoom } from 'src/entities/dealChatRoom.entity';
import { DealChatRoomUser } from 'src/entities/dealChatRoomUser.entity';
import { DealChatRoomUserMsg } from 'src/entities/dealChatRoomUserMsg.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { User } from 'src/entities/user.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

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
			Code
		])
	],
	providers: [ChatGateway, ChatService]
})
export class ChatModule {}
