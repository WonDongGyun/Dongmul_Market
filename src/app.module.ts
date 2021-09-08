import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './domain/chat/chat.module';
import { AccountModule } from './domain/account/account.module';
import { User } from './entities/user.entity';
import { SaleItem } from './entities/saleItem.entity';
import { ItemChatRoom } from './entities/itemChatRoom.entity';
import { ItemChatRoomUser } from './entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from './entities/itemChatRoomUserMsg.entity';
import { MainPageModule } from './domain/main-page/main-page.module';
import { Code } from './entities/code.entity';

import { EmailAuth } from './entities/emailAuth.entity';
import { MyPageModule } from './domain/my-page/my-page.module';
import { KickUser } from './entities/kickUser.entity';
import { MessageModule } from './global/message/message.module';

import { PostDetailModule } from './domain/post-detail/post-detail.module';

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
			Code,
			EmailAuth,
			KickUser
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
				Code,
				EmailAuth,
				KickUser
			],
			synchronize: true
		}),
		// ServeStaticModule.forRoot({
		// 	rootPath: join(__dirname, '..', '.well-known/acme-challenge')
		// }),
		ChatModule,
		AccountModule,
		MainPageModule,
		MyPageModule,
		MessageModule,
		PostDetailModule
	]
})
export class AppModule {}
