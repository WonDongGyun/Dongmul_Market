import { Module } from '@nestjs/common';
import { MyPageService } from './my-page.service';
import { MyPageController } from './my-page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { Code } from 'src/entities/code.entity';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { JwtStrategy } from 'src/account/jwt.strategy';
import { MessageService } from 'src/message/message.service';
import { KickUser } from 'src/entities/kickUser.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			SaleItem,
			ItemChatRoom,
			ItemChatRoomUser,
			ItemChatRoomUserMsg,
			KickUser,
			Code,
			EmailAuth
		])
	],
	controllers: [MyPageController],
	providers: [MyPageService, JwtStrategy, MessageService]
})
export class MyPageModule {}
