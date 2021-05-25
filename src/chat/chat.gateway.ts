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
import { ItemChatDto } from './dto/itemChat.dto';
import * as jwt from 'jsonwebtoken';
import { AutoJoinDto } from './dto/autoJoin.dto';
import { KickUserDto } from './dto/kickUser.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { MessageService } from 'src/message/message.service';
import * as fs from 'fs';

// **************************************
// * gateway: chat
// * programer: DongGyun Won
// **************************************
const httpsOptions = {
	key: fs.readFileSync(
		'/etc/letsencrypt/live/dongmul.shop/privkey.pem',
		'utf8'
	),
	cert: fs.readFileSync(
		'/etc/letsencrypt/live/dongmul.shop/cert.pem',
		'utf8'
	),
	ca: fs.readFileSync('/etc/letsencrypt/live/dongmul.shop/chain.pem', 'utf8')
};
@WebSocketGateway(3001, {
	namespace: '/chatting',
	secure: true,
	rejectUnauthorized: true,
	httpsOptions
})
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly chatService: ChatService,
		private readonly messageService: MessageService
	) {}
	private logger: Logger = new Logger('ChatGateway');

	@WebSocketServer() server: Server;

	// front => socket.emit('sendMsg', data = { email: '채팅을 친 사용자', icrId: icrId, chatMsg: '안녕하세요!'})
	// 채팅 메시지 테이블에 저장하기
	// 이메일, 닉네임, 메시지, 채팅한 시간 정보가 담겨있음.
	@SubscribeMessage('sendMsg')
	async handleMessage(client: Socket, itemChatDto: ItemChatDto) {
		const chatMsg = await this.chatService.saveChatMsg(itemChatDto);
		if (chatMsg['msg'] == 'success') {
			this.server.to(itemChatDto.icrId).emit('getMsg', chatMsg['data']);
		} else {
			client.emit('getMsg', chatMsg['errorMsg']);
		}
	}

	// '님이 입장하셨습니다.'
	// 채팅방 사용자 테이블에 해당 사용자 등록하기.
	// itemChatRoomUser 테이블에 존재하면 넣고, 아니라면 안넣음
	// button.click
	// front => socket.emit('joinRoom', data = { email: '사용자 email', icrId: icrId})
	@SubscribeMessage('joinRoom')
	async handleJoinRoom(client: Socket, itemChatJoinDto: ItemChatJoinDto) {
		const joinMsg = await this.chatService.joinChatRoom(
			itemChatJoinDto,
			client.id
		);

		// 채팅방 참가자 보여주기
		const chatUserList = await this.chatService.showChatUser(
			itemChatJoinDto
		);

		const config = {
			icrId: itemChatJoinDto.icrId,
			userList: chatUserList,
			msgList: joinMsg
		};

		// 접속하셨습니다 메시지
		// 채팅방 유저 목록에 추가
		client.join(itemChatJoinDto.icrId);
		this.server.to(itemChatJoinDto.icrId).emit('addUser', config);
	}

	// 해당 유저와 교환 성공!
	@SubscribeMessage('exchange')
	async handleExchange(client: Socket, exchangeDto: ExchangeDto) {
		await this.chatService
			.exchange(exchangeDto)
			.then(async (exchangeYn) => {
				if (exchangeYn['msg'] == 'success') {
					// 현재 접속중인 모든 사용자들을 현재의 채팅방에서 내보냄
					// 프론트에서 무조건 모두에게 팝업을 띄워주어야 함.

					this.server
						.to(exchangeDto.icrId)
						.emit('exchange', exchangeYn);
					for (const key in client.adapter.rooms[exchangeDto.icrId]
						.sockets) {
						this.server.sockets[key].leave(exchangeDto.icrId);
					}
				}
			});
	}

	// '님이 강퇴당하셨습니다.'
	// button.click
	// front => socket.emit('kickUser', icrId)
	@SubscribeMessage('kickUser')
	async handleKickUser(client: Socket, kickUserDto: KickUserDto) {
		await this.chatService
			.kickUser(kickUserDto)
			.then(async (kickClient) => {
				if (kickClient['msg'] == 'success') {
					// ~님이 강퇴당하셨습니다.
					// 프론트에서는 받을 때 현재 접속한 사람의 이메일이랑 맞다면 alert을 띄워야 함
					// 그 후 메인화면으로 강제로 이동

					this.server
						.to(kickUserDto.icrId)
						.emit('kickUser', kickClient['kickData']);

					// 만약 그 클라이언트가 실제로 현재 접속중이라면 방을 떠나게 만듬
					for (const key in client.adapter.rooms[kickUserDto.icrId]
						.sockets) {
						if (key == kickClient['kickId']) {
							this.server.sockets[key].leave(kickUserDto.icrId);
						}
					}
				} else {
					return kickClient;
				}
			});
	}

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
		try {
			const [type, token] = auth['token'].split(' ');

			if (type != 'bearer') {
				return this.messageService.handleAuthenticateErr();
			}
			const payload = jwt.verify(token, process.env.SECRET_KEY);
			if (payload) {
				return this.messageService.returnSuccess();
			} else {
				return this.messageService.handleAuthenticateErr();
			}
		} catch {
			return this.messageService.handleAuthenticateErr();
		}
	}

	// 소캣 연결
	async handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);

		if (
			client.handshake.query.email == undefined ||
			client.handshake.query.icrId == undefined
		) {
			client.emit('setRoom', this.messageService.handleConnectionErr());
		} else {
			const autoJoin: AutoJoinDto = new AutoJoinDto();
			autoJoin.email = client.handshake.query.email;
			autoJoin.icrId = client.handshake.query.icrId;

			await this.chatService
				.joinAuto(autoJoin, client.id)
				.then(async (findJoin) => {
					if (findJoin) {
						if (findJoin['msg'] == 'success') {
							// 지난 채팅 보여주기
							const chatHistory = await this.chatService.showGroupChat(
								autoJoin
							);
							// 채팅방 참가자 보여주기
							const chatUserList = await this.chatService.showChatUser(
								autoJoin
							);

							const config = {
								icrId: autoJoin.icrId,
								userList: chatUserList,
								msgList: chatHistory
							};

							// 채팅방 접속 및 setRoom 정보 뿌리기
							client.join(autoJoin.icrId);
							client.emit('setRoom', config);
						} else {
							client.emit('setRoom', findJoin);
						}
					} else {
						client.emit(
							'setRoom',
							this.messageService.handleConnectionErr()
						);
					}
				});
		}
	}
}
