import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { AccountModule } from './account/account.module';
import { User } from './entities/user.entity';
import { SaleItem } from './entities/saleItem.entity';
import { ItemChatRoom } from './entities/itemChatRoom.entity';
import { ItemChatRoomUser } from './entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from './entities/itemChatRoomUserMsg.entity';
import { DealChatRoom } from './entities/dealChatRoom.entity';
import { DealChatRoomUser } from './entities/dealChatRoomUser.entity';
import { DealChatRoomUserMsg } from './entities/dealChatRoomUserMsg.entity';
import { MainPageModule } from './main-page/main-page.module';
import { Code } from './entities/code.entity';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
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
		]),
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: process.env.DB_HOST,
			port: 3306,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: 'dongmul',
			entities: [
				User,
				SaleItem,
				ItemChatRoom,
				ItemChatRoomUser,
				ItemChatRoomUserMsg,
				DealChatRoom,
				DealChatRoomUser,
				DealChatRoomUserMsg,
				Code
			],
			synchronize: true
		}),
		ChatModule,
		AccountModule,
		MainPageModule
	]
})
export class AppModule {}
