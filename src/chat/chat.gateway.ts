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
import { DealChatDto } from './dto/dealChat.dto';
import { DealChatJoinDto } from './dto/dealChatJoin.dto';
import { KickUserDto } from './dto/kickUser.dto';

@WebSocketGateway(3001, { namespace: '/chatting' })
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly chatService: ChatService) {}
	private logger: Logger = new Logger('ChatGateway');

	@WebSocketServer() server: Server;

	// front => socket.emit('sendMsg', data = { email: '채팅을 친 사용자', icrId: icrId, chatMsg: '안녕하세요!'})
	// 채팅 메시지 테이블에 저장하기
	// 이메일, 닉네임, 메시지, 채팅한 시간 정보가 담겨있음.
	@SubscribeMessage('sendMsg')
	async handleMessage(client: Socket, itemChatDto: ItemChatDto) {
		const chatMsg = await this.chatService.saveChatMsg(itemChatDto);
		console.log('sendMsg Data => ', itemChatDto);
		console.log('getMsg Data => ', chatMsg);
		if (chatMsg['msg'] == 'success') {
			this.server.to(itemChatDto.icrId).emit('getMsg', chatMsg['data']);
		} else {
			client.emit('getMsg', chatMsg['errorMsg']);
		}
	}

	// @SubscribeMessage('sendPersonalMsg')
	// async handlePersonalMessage(client: Socket, dealChatDto: DealChatDto) {
	// 	console.log(dealChatDto);
	// 	const chatMsg = await this.chatService.savePersonalChatMsg(dealChatDto);
	// 	console.log('sendPersonalMsg => ', chatMsg);
	// 	this.server.to(dealChatDto.dicrId).emit('getPersonalMsg', chatMsg);
	// }

	// 이메일이 해당 방의 방장과 같다면, 단체 채팅방 및 1:1 채팅방 접속한 인원들을 보여줌.
	// window.onload
	// front => socket.emit('showUserList', data = { email: '현재 상세페이지에 들어온 사용자', icrId: icrId })
	// @SubscribeMessage('showUserList')
	// async handleShowUserRoom(client: Socket, showUserDto: ShowUserDto) {
	// 	console.log(showUserDto);
	// 	await this.chatService
	// 		.showGroupUser(showUserDto)
	// 		.then(async (groupUserData) => {
	// 			if (groupUserData) {
	// 				await this.chatService
	// 					.showOneUser(showUserDto)
	// 					.then((oneUserData) => {
	// 						const data = {
	// 							group: groupUserData,
	// 							one: oneUserData
	// 						};
	// 						console.log(data);
	// 						client.emit('returnUserList', data);
	// 					});
	// 			}
	// 		});
	// }

	// '님이 입장하셨습니다.'
	// 채팅방 사용자 테이블에 해당 사용자 등록하기.
	// itemChatRoomUser 테이블에 존재하면 넣고, 아니라면 안넣음
	// button.click
	// front => socket.emit('joinRoom', data = { email: '사용자 email', icrId: icrId})
	@SubscribeMessage('joinRoom')
	async handleJoinRoom(client: Socket, itemChatJoinDto: ItemChatJoinDto) {
		console.log('joinRoom Data => ', itemChatJoinDto);
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
		console.log('joinMsg => ', joinMsg);
	}

	// @SubscribeMessage('joinPersonalRoom')
	// async handlejoinPersonalRoom(
	// 	client: Socket,
	// 	dealChatJoinDto: DealChatJoinDto
	// ) {
	// 	console.log(dealChatJoinDto);
	// 	const joinMsg = await this.chatService.joinPersonalChatRoom(
	// 		dealChatJoinDto
	// 	);
	// 	client.join(dealChatJoinDto.dicrId);
	// 	// 접속하셨습니다 메시지
	// 	// this.server.to(itemChatJoinDto.icrId).emit('returnJoinMsg', joinMsg);
	// 	// 채팅방 유저 목록에 추가
	// 	this.server.to(dealChatJoinDto.dicrId).emit('addUser', joinMsg);
	// 	console.log('joinMsg => ', joinMsg);
	// }

	// 1:1 채팅 같은 경우에는, join하는 버튼이 아니라, 방장이 해당 유저를 추가해주는 식으로 들어가진다.
	// 따라서 방장이 1:1채팅방에 유저를 추가해주면, 실시간으로 해당 유저의 1:1 채팅방이 열려야 한다.
	// @SubscribeMessage('joinOneRoom')
	// async handleJoinOneRoom(
	// 	client: Socket,
	// 	itemChatOneJoinDto: ItemChatOneJoinDto
	// ) {
	// 	console.log(client, itemChatOneJoinDto);
	// }

	// '님이 퇴장하셨습니다.'
	// front => socket.emit('removeUser', icrId)
	@SubscribeMessage('kickUser')
	async handleKickUser(client: Socket, kickUserDto: KickUserDto) {
		await this.chatService
			.kickUser(kickUserDto)
			.then(async (kickClient) => {
				if (kickClient['msg'] == 'success') {
					this.server.sockets[kickClient['kickId']].leave(
						kickUserDto.icrId
					);

					console.log('kickUser => ', kickUserDto);
					console.log('kickUser Data => ', kickClient['kickData']);

					// ~님이 강퇴당하셨습니다.
					this.server
						.to(kickUserDto.icrId)
						.emit('kickUser', kickClient['kickData']);
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
				return { msg: 'fail', errorMsg: 'no login' };
			}
			const payload = jwt.verify(token, process.env.SECRET_KEY);
			if (payload) {
				return { msg: 'success' };
			} else {
				return { msg: 'fail', errorMsg: 'no login' };
			}
		} catch {
			return { msg: 'fail', errorMsg: 'no login' };
		}
	}

	async handleConnection(client: Socket, ...args: any[]) {
		console.log('client email => ', client.handshake.query.email);
		console.log('client icrId => ', client.handshake.query.icrId);
		console.log('client id => ', client.id);
		// const a = 'hello_world';
		// client.join(a);
		// console.log('room => ', client.adapter.rooms.hello_world);
		// console.log(client.id);
		// console.log(client.client.id);
		// console.log(this.server.sockets);
		// this.server.sockets[client.id].leave(a);

		// console.log('room2 => ', client.adapter.rooms.hello_world);
		this.logger.log(`Client connected: ${client.id}`);

		if (
			client.handshake.query.email == undefined ||
			client.handshake.query.icrId == undefined
		) {
			client.emit('setRoom', {
				msg: 'fail',
				errorMsg: '이메일 혹은 채팅방id를 확인해주세요.'
			});
		} else {
			const autoJoin: AutoJoinDto = new AutoJoinDto();
			autoJoin.email = client.handshake.query.email;
			autoJoin.icrId = client.handshake.query.icrId;

			console.log(
				client.handshake.query.email,
				client.handshake.query.icrId
			);

			await this.chatService
				.joinAuto(autoJoin, client.id)
				.then(async (findJoin) => {
					console.log(findJoin);
					if (findJoin) {
						console.log(findJoin['msg'] == 'success');
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

							console.log(config);

							// 채팅방 접속 및 setRoom 정보 뿌리기
							client.join(autoJoin.icrId);
							client.emit('setRoom', config);
						} else {
							client.emit('setRoom', findJoin);
						}
					} else {
						client.emit('setRoom', {
							msg: 'fail',
							errorMsg: '이메일 혹은 채팅방id를 확인해주세요.'
						});
					}
				});
		}
	}
}
