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

// nestjs Gateway는 기본적으로 socket.io와 ws와 호환됩니다.
// @WebSocketGateway => socket.io 기능에 대한 엑세스 제공
// OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect => 클라이언트가 서버에 연결되거나 현재 클라이언트의 연결이 끊어 질 경우 기록함.
@WebSocketGateway(3001, { namespace: '/chatting' })
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	// @WebSocketServer => websockets 서버 인스턴스에 대한 엑세스를 제공함
	@WebSocketServer() server: Server;

	// logger를 사용해서 내용을 확인하자
	private logger: Logger = new Logger('ChatGateway');

	// @handleMessage => emit 함수를 이용하여 서버에 연결된 모든 클라이언트에게 데이터를 보냄
	// @handleMessage 를 사용하여 클라이언트에서 msgToServer라는 이름의 이벤트로 보내면 @SubscribeMessage 를 통해 수신함
	// 클라이언트에서 서비쪽 메시지를 받고 싶다면, msgToClient를 socket.on해서 받아야 한다.
	// handleMessage(client: Socket, text: string): WsResponse<string>
	// 그냥 리턴해서 반환하니까 다른 브라우저에서 채팅을 못 보여주더라?
	// 그래서 this.server.emit을 사용해서 브라우저 탭이 달라도 보여줄 수 있게 만들었어!

	// @SubscribeMessage('msgToServer')
	// handleMessage(client: Socket, text: string): void {
	// 	// this.server.emit('msgToClient', text);
	// 	// return { event: 'msgToClient', data: text };
	// }

	@SubscribeMessage('chatToServer')
	handleMessage(client: Socket, message) {
		console.log(message);
		this.server.to(message.room).emit('chatToClient', message);
	}

	@SubscribeMessage('joinRoom')
	handleJoinRoom(client: Socket, room: string) {
		client.join(room);
		client.emit('joinedRoom', room);
	}

	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(client: Socket, room: string) {
		client.leave(room);
		client.emit('leaveRoom', room);
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	// handleConnection => 클라이언트의 연결 끊김을 확인
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	// handleConnection => 클라이언트의 연결을 확인
	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}
}
