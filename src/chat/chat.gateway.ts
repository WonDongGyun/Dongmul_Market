import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ItemChatJoinDto } from './dto/itemChatJoin.dto';
import { ChatService } from './chat.service';
import { ItemChatDto } from './dto/itemChatDto.dto';
import { ShowUserDto } from './dto/showUserDto.dto';
import { JoinAutoDto } from './dto/joinAuto.dto';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway(3001, { namespace: '/chatting' })
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly chatService: ChatService) {}
	private logger: Logger = new Logger('ChatGateway');

	@WebSocketServer() server: Server;

	// '홍길동: 안녕하세요! 2021년 5월 6일'
	// front => socket.emit('sendMsg', data = { email: '채팅을 친 사용자', icrId: icrId, chatMsg: '안녕하세요!'})
	// 채팅 메시지 테이블에 저장하기
	@SubscribeMessage('sendMsg')
	async handleMessage(client: Socket, itemChatDto: ItemChatDto) {
		console.log(itemChatDto);
		const data = await this.chatService.saveChatMsg(itemChatDto);
		this.server.to(itemChatDto.icrId).emit('returnMsg', data);
	}

	// 남은 인원을 실시간으로 체크
	// 해당 방의 방장인지를 체크하고 보여줌.
	// window.onload
	// front => socket.emit('showUserList', data = { email: '현재 상세페이지에 들어온 사용자', icrId: icrId })
	// Back => 그 사람이 방장이면 user 데이터 줌
	@SubscribeMessage('showUserList')
	async handleShowUserRoom(client: Socket, showUserDto: ShowUserDto) {
		console.log(showUserDto);
		await this.chatService.showUser(showUserDto).then((userData) => {
			if (userData) {
				client.emit('returnUserList', userData);
			}
		});
	}

	// 채팅방 사용자 테이블에 해당 사용자가 이미 등록되어 있다면 자동으로 join
	// 채팅방 사용자 테이블에 해당 사용자가 등록되어 있지 않다면 자동으로 join 안함
	// 또한 나갔다 들어온 이후에는 이전의 채팅방 메시지가 보여야 하므로, 해당 사용자가 입력한 첫 메시지 이후의 모든 메시지를 가져옴!
	@SubscribeMessage('joinAuto')
	async handleJoinAutoRoom(client: Socket, joinAutoDto: JoinAutoDto) {
		return await this.chatService
			.joinAuto(joinAutoDto)
			.then(async (joinAuto) => {
				if (joinAuto) {
					const chatList = await this.chatService.showChat(
						joinAutoDto
					);
					client.join(joinAutoDto.icrId);
					client.emit('returnJoinAuto', chatList);
				}
			});
	}

	// '님이 입장하셨습니다.'
	// 채팅방 사용자 테이블에 해당 사용자 등록하기.
	// itemChatRoomUser 테이블에 존재하면 넣고, 아니라면 안넣음
	// button.click
	// front => socket.emit('joinRoom', data = { email: '사용자 email', icrId: icrId})
	@SubscribeMessage('joinRoom')
	async handleJoinRoom(client: Socket, itemChatJoinDto: ItemChatJoinDto) {
		console.log(itemChatJoinDto);
		await this.chatService.joinChatRoom(itemChatJoinDto);
		client.join(itemChatJoinDto.icrId);
		client.emit('returnJoinMsg', itemChatJoinDto.icrId);
	}

	// '님이 퇴장하셨습니다.'
	// front => socket.emit('leaveRoom', icrId)
	// @SubscribeMessage('leaveRoom')
	// handleLeaveRoom(client: Socket, room: string) {
	// 	client.leave(room);
	// 	client.emit('leaveRoom', room);
	// }

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	// handleConnection => 클라이언트의 연결 끊김을 확인
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	// handleConnection => 클라이언트의 연결을 확인
	// handleConnection(client: Socket, ...args: any[]) {
	// 	this.logger.log(`Client connected: ${client.id}`);
	// }

	// 인증 하기
	// async 함수로 만들고 return으로 해주니까 front에서 on만으로도 결과값을 받을 수 있게 됨.
	@SubscribeMessage('authenticate')
	async handleAuthenticate(client: Socket, auth: string) {
		const [type, token] = auth['token'].split(' ');

		if (type != 'Bearer') {
			// client.emit('returnAuth', { msg: 'fail', errorMsg: 'no login' });
			return { msg: 'fail', errorMsg: 'no login' };
		}

		try {
			const payload = jwt.verify(token, process.env.SECRET_KEY);
			if (payload) {
				// await client.emit('returnAuth', { msg: 'success' });
				return { msg: 'success' };
			} else {
				// await client.emit('returnAuth', {
				// msg: 'fail',
				// errorMsg: 'no login'
				// });
				return { msg: 'fail', errorMsg: 'no login' };
			}
		} catch {
			// await client.emit('returnAuth', {
			// 	msg: 'fail',
			// 	errorMsg: 'no login'
			// });

			return { msg: 'fail', errorMsg: 'no login' };
		}
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}
}
