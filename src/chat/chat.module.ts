import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from 'src/entities/code.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { KickUser } from 'src/entities/kickUser.entity';
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
			Code,
			KickUser
		])
	],
	providers: [ChatGateway, ChatService]
})
export class ChatModule {}
