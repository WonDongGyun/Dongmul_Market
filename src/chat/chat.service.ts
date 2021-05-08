import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { DealChatRoom } from 'src/entities/dealChatRoom.entity';
import { DealChatRoomUser } from 'src/entities/dealChatRoomUser.entity';
import { DealChatRoomUserMsg } from 'src/entities/dealChatRoomUserMsg.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { Repository } from 'typeorm';
import { ItemChatDto } from './dto/itemChatDto.dto';
import { ItemChatJoinDto } from './dto/itemChatJoin.dto';
import { Code } from 'src/entities/code.entity';
import { ShowUserDto } from './dto/showUserDto.dto';
import { JoinAutoDto } from './dto/joinAuto.dto';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@InjectRepository(SaleItem)
		private readonly saleItemRepository: Repository<SaleItem>,

		@InjectRepository(ItemChatRoom)
		private readonly itemChatRoomRepository: Repository<ItemChatRoom>,

		@InjectRepository(ItemChatRoomUser)
		private readonly itemChatRoomUserRepository: Repository<ItemChatRoomUser>,

		@InjectRepository(ItemChatRoomUserMsg)
		private readonly itemChatRoomUserMsgRepository: Repository<ItemChatRoomUserMsg>,

		@InjectRepository(DealChatRoom)
		private readonly dealChatRoomRepository: Repository<DealChatRoom>,

		@InjectRepository(DealChatRoomUser)
		private readonly dealChatRoomUserRepository: Repository<DealChatRoomUser>,

		@InjectRepository(DealChatRoomUserMsg)
		private readonly dealChatRoomUserMsgRepository: Repository<DealChatRoomUserMsg>,

		@InjectRepository(Code)
		private readonly codeRepository: Repository<Code>
	) {}

	// 방장에게 현재 채팅중인 사람 보여주기
	async showUser(showUserDto: ShowUserDto) {
		const user: User = new User();
		user.email = showUserDto.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = showUserDto.icrId;

		const saleItem: SaleItem = new SaleItem();
		saleItem.user = user;
		saleItem.itemChatRoom = itemChatRoom;

		return await this.saleItemRepository
			.findOne(saleItem)
			.then(async (findMaster) => {
				if (findMaster) {
					return await this.itemChatRoomUserRepository
						.createQueryBuilder('icru')
						.select('icru.icruId', 'icruId')
						.addSelect('icru.email', 'email')
						.addSelect('u.nickname', 'nickname')
						.addSelect('icru.chooseYn', 'chooseYn')
						.addSelect(
							`CASE WHEN icru.email = '${showUserDto.email}' THEN "방장" ELSE "참가자" END`,
							'tier'
						)
						.innerJoin(User, 'u', 'u.email = icru.email')
						.where('icru.icrId = :icrId', {
							icrId: showUserDto.icrId
						})
						.getRawMany();
				}
			});
	}

	// 채팅방 사용자 테이블에 해당 사용자가 이미 등록되어 있다면 자동으로 join
	async joinAuto(joinAutoDto: JoinAutoDto) {
		const user: User = new User();
		user.email = joinAutoDto.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = joinAutoDto.icrId;

		const itemChatRoomUser: ItemChatRoomUser = new ItemChatRoomUser();
		itemChatRoomUser.user = user;
		itemChatRoomUser.itemChatRoom = itemChatRoom;

		return this.itemChatRoomUserRepository.findOne(itemChatRoomUser);
	}

	// 지난 채팅 내역 보여주기
	// 해당 사용자가 해당 채팅방에 들어온 시간 이후의 모든 채팅을 보여줌
	async showChat(joinAutoDto: JoinAutoDto) {
		const user: User = new User();
		user.email = joinAutoDto.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = joinAutoDto.icrId;

		return await this.itemChatRoomUserRepository
			.createQueryBuilder('icru')
			.select('icru.createdDt', 'createdDt')
			.where('icru.email = :email', { email: joinAutoDto.email })
			.andWhere('icru.icrId = :icrId', { icrId: joinAutoDto.icrId })
			.getRawOne()
			.then(async (findDate) => {
				if (findDate) {
					const dt = findDate['createdDt'].toISOString();
					return await this.itemChatRoomUserMsgRepository
						.createQueryBuilder('icrum')
						.select('icrum.icruMsgId', 'icruMsgId')
						.addSelect('icrum.email', 'email')
						.addSelect('u.nickname', 'nickname')
						.addSelect('icrum.chatMsg', 'chatMsg')
						.innerJoin(User, 'u', 'u.email = icrum.email')
						.where('icrum.icrId = :icrId', {
							icrId: joinAutoDto.icrId
						})
						.andWhere(`icrum.createdDt > '${dt}'`)
						.getRawMany();
				}
			});
	}

	// 사용자가 채팅방 들어오면 사용자 추가
	async joinChatRoom(itemChatJoinDto: ItemChatJoinDto) {
		const user: User = new User();
		user.email = itemChatJoinDto.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = itemChatJoinDto.icrId;

		const itemChatRoomUser: ItemChatRoomUser = new ItemChatRoomUser();
		itemChatRoomUser.user = user;
		itemChatRoomUser.itemChatRoom = itemChatRoom;

		// itemChatRoomUser 테이블에 해당 사용자가 없다면 사용자 추가
		await this.itemChatRoomUserRepository
			.findOne({
				user: user,
				itemChatRoom: itemChatRoom
			})
			.then(async (findUser) => {
				if (!findUser) {
					await this.itemChatRoomUserRepository.insert(
						itemChatRoomUser
					);
				}
			});
	}

	// 채팅 저장하기
	async saveChatMsg(itemChatDto: ItemChatDto) {
		const user: User = new User();
		user.email = itemChatDto.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = itemChatDto.icrId;

		const itemChatRoomUserMsg: ItemChatRoomUserMsg = new ItemChatRoomUserMsg();
		itemChatRoomUserMsg.user = user;
		itemChatRoomUserMsg.itemChatRoom = itemChatRoom;
		itemChatRoomUserMsg.chatMsg = itemChatDto.chatMsg;
		await this.itemChatRoomUserMsgRepository.insert(itemChatRoomUserMsg);

		return await this.itemChatRoomUserMsgRepository
			.createQueryBuilder('icrum')
			.select('icrum.icruMsgId', 'icruMsgId')
			.addSelect('icrum.email', 'email')
			.addSelect('icrum.chatMsg', 'chatMsg')
			.addSelect('icrum.createdDt', 'createdDt')
			.where('icrum.email = :email', { email: itemChatDto.email })
			.andWhere('icrum.icrId = :icrId', { icrId: itemChatDto.icrId })
			.orderBy('icrum.createdDt', 'DESC')
			.limit(1)
			.getRawOne()
			.then((data) => {
				return { msg: 'success', data: data };
			});
	}
}
