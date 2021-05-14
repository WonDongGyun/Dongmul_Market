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
import { ItemChatDto } from './dto/itemChat.dto';
import { ItemChatJoinDto } from './dto/itemChatJoin.dto';
import { Code } from 'src/entities/code.entity';
import { ShowUserDto } from './dto/showUser.dto';
import { JoinAutoDto } from './dto/joinAuto.dto';
import { AutoJoinDto } from './dto/autoJoin.dto';
import { KickUser } from 'src/entities/kickUser.entity';
import { DealChatDto } from './dto/dealChat.dto';
import { DealChatJoinDto } from './dto/dealChatJoin.dto';
import { KickUserDto } from './dto/kickUser.dto';

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
		private readonly codeRepository: Repository<Code>,

		@InjectRepository(KickUser)
		private readonly kickUserRepository: Repository<KickUser>
	) {}

	// 방장에게 현재 단체 채팅중인 사람 보여주기
	// async showGroupUser(showUserDto: ShowUserDto) {
	// 	const user: User = new User();
	// 	user.email = showUserDto.email;

	// 	const itemChatRoom: ItemChatRoom = new ItemChatRoom();
	// 	itemChatRoom.icrId = showUserDto.icrId;

	// 	const saleItem: SaleItem = new SaleItem();
	// 	saleItem.user = user;
	// 	saleItem.itemChatRoom = itemChatRoom;

	// 	return await this.saleItemRepository
	// 		.findOne(saleItem)
	// 		.then(async (findMaster) => {
	// 			if (findMaster) {
	// 				return await this.itemChatRoomUserRepository
	// 					.createQueryBuilder('icru')
	// 					.select('icru.icruId', 'icruId')
	// 					.addSelect('icru.email', 'email')
	// 					.addSelect('u.nickname', 'nickname')
	// 					.addSelect('icru.chooseYn', 'chooseYn')
	// 					.addSelect(
	// 						`CASE WHEN icru.email = '${showUserDto.email}' THEN "방장" ELSE "참가자" END`,
	// 						'tier'
	// 					)
	// 					.innerJoin(User, 'u', 'u.email = icru.email')
	// 					.where('icru.icrId = :icrId', {
	// 						icrId: showUserDto.icrId
	// 					})
	// 					.getRawMany();
	// 			}
	// 		});
	// }

	// 현재 단체 채팅중인 사람 보여주기
	async showChatUser(autoJoin: AutoJoinDto) {
		return await this.itemChatRoomUserRepository
			.createQueryBuilder('icru')
			.select('icru.icruId', 'icruId')
			.addSelect('icru.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('icru.chooseYn', 'chooseYn')
			.addSelect(
				`CASE WHEN si.email = icru.email THEN "방장" ELSE "참가자" END`,
				'isBoss'
			)
			.innerJoin(User, 'u', 'u.email = icru.email')
			.innerJoin(SaleItem, 'si', 'si.icrId = icru.icrId')
			.where('icru.icrId = :icrId', {
				icrId: autoJoin.icrId
			})
			.getRawMany();
	}

	// 방장에게 현재 1:1 채팅중인 사람 보여주기
	// 이미 단체 채팅 사람 가져올 때 확인을 마쳤으므로, 중간과정은 생략돼도 된다.
	// async showOneUser(showUserDto: ShowUserDto) {
	// 	return await this.dealChatRoomUserRepository
	// 		.createQueryBuilder('dicru')
	// 		.select('dicru.dicruId', 'dicruId')
	// 		.addSelect('dicru.email', 'email')
	// 		.addSelect('u.nickname', 'nickname')
	// 		.addSelect('dicru.changeYn', 'changeYn')
	// 		.addSelect(
	// 			`CASE WHEN dicru.email = '${showUserDto.email}' THEN "방장" ELSE "참가자" END`,
	// 			'tier'
	// 		)
	// 		.innerJoin(User, 'u', 'u.email = dicru.email')
	// 		.where('dicru.dicrId = :dicrId', {
	// 			dicrId: showUserDto.dicrId
	// 		})
	// 		.getRawMany();
	// }

	// 채팅방 사용자 테이블에 해당 사용자가 이미 등록되어 있다면 자동으로 join
	async joinAuto(autoJoin: AutoJoinDto, clientId: string) {
		const user: User = new User();
		user.email = autoJoin.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = autoJoin.icrId;

		return this.itemChatRoomUserRepository
			.findOne({
				where: {
					user: user,
					itemChatRoom: itemChatRoom
				}
			})
			.then(async (findUser) => {
				if (findUser) {
					this.itemChatRoomUserRepository.update(findUser.icruId, {
						clientId: clientId
					});
					return findUser;
				}
			});
	}

	// 지난 단체 채팅 내역 보여주기
	// 해당 사용자가 해당 채팅방에 들어온 시간 이후의 모든 채팅을 보여줌
	async showGroupChat(itemChatJoinDto: ItemChatJoinDto) {
		return await this.itemChatRoomUserRepository
			.createQueryBuilder('icru')
			.select('icru.createdDt', 'createdDt')
			.where('icru.email = :email', { email: itemChatJoinDto.email })
			.andWhere('icru.icrId = :icrId', { icrId: itemChatJoinDto.icrId })
			.getRawOne()
			.then(async (findDate) => {
				if (findDate) {
					const dt = findDate['createdDt'].toISOString();
					return await this.itemChatRoomUserMsgRepository
						.createQueryBuilder('icrum')
						.select('icrum.icruMsgId', 'icruMsgId')
						.addSelect('icrum.email', 'email')
						.addSelect('u.nickname', 'nickname')
						.addSelect('c.codeName', 'msgType')
						.addSelect('icrum.chatMsg', 'chatMsg')
						.addSelect('icrum.createdDt', 'createdDt')
						.innerJoin(User, 'u', 'u.email = icrum.email')
						.innerJoin(Code, 'c', 'c.codeId = icrum.textStatus')
						.where('icrum.icrId = :icrId', {
							icrId: itemChatJoinDto.icrId
						})
						.andWhere(`icrum.createdDt > '${dt}'`)
						.orderBy('icrum.createdDt', 'ASC')
						.getRawMany();
				}
			});
	}

	// 지난 1:1 채팅 내역 보여주기
	// 해당 사용자가 해당 채팅방에 들어온 시간 이후의 모든 채팅을 보여줌
	// async showOneChat(joinAutoDto: JoinAutoDto) {
	// 	return await this.dealChatRoomUserRepository
	// 		.createQueryBuilder('dicru')
	// 		.select('dicru.createdDt', 'createdDt')
	// 		.where('dicru.email = :email', { email: joinAutoDto.email })
	// 		.andWhere('dicru.dicrId = :dicrId', { dicrId: joinAutoDto.dicrId })
	// 		.getRawOne()
	// 		.then(async (findDate) => {
	// 			if (findDate) {
	// 				const dt = findDate['createdDt'].toISOString();
	// 				return await this.dealChatRoomUserMsgRepository
	// 					.createQueryBuilder('dicrum')
	// 					.select('dicrum.dicruMsgId', 'dicruMsgId')
	// 					.addSelect('dicrum.email', 'email')
	// 					.addSelect('u.nickname', 'nickname')
	// 					.addSelect('dicrum.chatMsg', 'chatMsg')
	// 					.addSelect('dicrum.createdDt', 'createdDt')
	// 					.innerJoin(User, 'u', 'u.email = dicrum.email')
	// 					.where('dicrum.dicrId = :dicrId', {
	// 						dicrId: joinAutoDto.dicrId
	// 					})
	// 					.andWhere(`dicrum.createdDt > '${dt}'`)
	// 					.orderBy('dicrum.createdDt', 'ASC')
	// 					.getRawMany();
	// 			}
	// 		});
	// }

	// 사용자가 채팅방 들어오면 사용자 추가
	async joinChatRoom(itemChatJoinDto: ItemChatJoinDto, clientId: string) {
		const user: User = new User();
		user.email = itemChatJoinDto.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = itemChatJoinDto.icrId;

		const itemChatRoomUser: ItemChatRoomUser = new ItemChatRoomUser();
		itemChatRoomUser.user = user;
		itemChatRoomUser.itemChatRoom = itemChatRoom;
		itemChatRoomUser.clientId = clientId;

		// main service쪽에서 이미 해당 유저가 가입했는지 안했는지를 판단해주고 있어서, 사용자 join 유무 판단 로직은 제거함.
		return await this.itemChatRoomUserRepository
			.insert(itemChatRoomUser)
			.then(async (insertUser) => {
				if (insertUser) {
					return await this.itemChatRoomUserRepository
						.createQueryBuilder('icru')
						.select('icru.icruId', 'icruId')
						.addSelect('icru.email', 'email')
						.addSelect('u.nickname', 'nickname')
						.addSelect('icru.chooseYn', 'chooseYn')
						.addSelect('icru.createdDt', 'createdDt')
						.innerJoin(User, 'u', 'u.email = icru.email')
						.where('icru.email = :email', {
							email: itemChatJoinDto.email
						})
						.andWhere('icru.icrId = :icrId', {
							icrId: itemChatJoinDto.icrId
						})
						.getRawOne()
						.then(async (saveUser) => {
							if (saveUser) {
								const itemChatRoomUserMsg: ItemChatRoomUserMsg = new ItemChatRoomUserMsg();
								itemChatRoomUserMsg.user = user;
								itemChatRoomUserMsg.itemChatRoom = itemChatRoom;
								itemChatRoomUserMsg.chatMsg =
									saveUser.nickname + '님이 입장하셨습니다.';
								itemChatRoomUserMsg.textStatus = 'TXT02';
								await this.itemChatRoomUserMsgRepository.insert(
									itemChatRoomUserMsg
								);

								return await this.itemChatRoomUserMsgRepository
									.createQueryBuilder('icrum')
									.select('icrum.icruMsgId', 'icruMsgId')
									.addSelect('icrum.email', 'email')
									.addSelect('u.nickname', 'nickname')
									.addSelect('c.codeName', 'msgType')
									.addSelect('icrum.chatMsg', 'chatMsg')
									.addSelect('icrum.createdDt', 'createdDt')
									.innerJoin(
										User,
										'u',
										'u.email = icrum.email'
									)
									.innerJoin(
										Code,
										'c',
										'c.codeId = icrum.testStatus'
									)
									.where('icrum.email = :email', {
										email: itemChatJoinDto.email
									})
									.andWhere('icrum.icrId = :icrId', {
										icrId: itemChatJoinDto.icrId
									})
									.orderBy('icrum.createdDt', 'DESC')
									.limit(1)
									.getRawOne()
									.then((data) => {
										return { msg: 'success', data: data };
									});
							}
						});
				}
			});
	}

	// async joinPersonalChatRoom(dealChatJoinDto: DealChatJoinDto) {
	// 	const user: User = new User();
	// 	user.email = dealChatJoinDto.email;

	// 	const dealChatRoom: DealChatRoom = new DealChatRoom();
	// 	dealChatRoom.dicrId = dealChatJoinDto.dicrId;

	// 	const dealChatRoomUser: DealChatRoomUser = new DealChatRoomUser();
	// 	dealChatRoomUser.user = user;
	// 	dealChatRoomUser.dealChatRoom = dealChatRoom;

	// 	return await this.dealChatRoomUserRepository
	// 		.insert(dealChatRoomUser)
	// 		.then(async (insertUser) => {
	// 			if (insertUser) {
	// 				return await this.dealChatRoomUserRepository
	// 					.createQueryBuilder('dicru')
	// 					.select('dicru.icruId', 'icruId')
	// 					.addSelect('dicru.email', 'email')
	// 					.addSelect('u.nickname', 'nickname')
	// 					.addSelect('dicru.changeYn', 'changeYn')
	// 					.addSelect('dicru.createdDt', 'createdDt')
	// 					.innerJoin(User, 'u', 'u.email = dicru.email')
	// 					.where('dicru.email = :email', {
	// 						email: dealChatJoinDto.email
	// 					})
	// 					.andWhere('dicru.dicrId = :dicrId', {
	// 						dicrId: dealChatJoinDto.dicrId
	// 					})
	// 					.getRawOne();
	// 			}
	// 		});
	// }

	// 단체 채팅 저장하기
	async saveChatMsg(itemChatDto: ItemChatDto) {
		const user: User = new User();
		user.email = itemChatDto.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = itemChatDto.icrId;

		const itemChatRoomUserMsg: ItemChatRoomUserMsg = new ItemChatRoomUserMsg();
		itemChatRoomUserMsg.user = user;
		itemChatRoomUserMsg.itemChatRoom = itemChatRoom;
		itemChatRoomUserMsg.chatMsg = itemChatDto.chatMsg;
		itemChatRoomUserMsg.textStatus = 'TXT01';
		await this.itemChatRoomUserMsgRepository.insert(itemChatRoomUserMsg);

		return await this.itemChatRoomUserMsgRepository
			.createQueryBuilder('icrum')
			.select('icrum.icruMsgId', 'icruMsgId')
			.addSelect('icrum.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('c.codeName', 'msgType')
			.addSelect('icrum.chatMsg', 'chatMsg')
			.addSelect('icrum.createdDt', 'createdDt')
			.innerJoin(User, 'u', 'u.email = icrum.email')
			.innerJoin(Code, 'c', 'c.codeId = icrum.testStatus')
			.where('icrum.email = :email', { email: itemChatDto.email })
			.andWhere('icrum.icrId = :icrId', { icrId: itemChatDto.icrId })
			.orderBy('icrum.createdDt', 'DESC')
			.limit(1)
			.getRawOne()
			.then((data) => {
				return { msg: 'success', data: data };
			});
	}

	// 1:1 채팅 저장하기
	// async savePersonalChatMsg(dealChatDto: DealChatDto) {
	// 	const user: User = new User();
	// 	user.email = dealChatDto.email;

	// 	const dealChatRoom: DealChatRoom = new DealChatRoom();
	// 	dealChatRoom.dicrId = dealChatDto.dicrId;

	// 	const dealChatRoomUserMsg: DealChatRoomUserMsg = new DealChatRoomUserMsg();
	// 	dealChatRoomUserMsg.user = user;
	// 	dealChatRoomUserMsg.dealChatRoom = dealChatRoom;
	// 	dealChatRoomUserMsg.chatMsg = dealChatDto.chatMsg;
	// 	await this.dealChatRoomUserMsgRepository.insert(dealChatRoomUserMsg);

	// 	return await this.dealChatRoomUserMsgRepository
	// 		.createQueryBuilder('dicrum')
	// 		.select('dicrum.dicruMsgId', 'dicruMsgId')
	// 		.addSelect('dicrum.email', 'email')
	// 		.addSelect('u.nickname', 'nickname')
	// 		.addSelect('dicrum.chatMsg', 'chatMsg')
	// 		.addSelect('dicrum.createdDt', 'createdDt')
	// 		.innerJoin(User, 'u', 'u.email = dicrum.email')
	// 		.where('dicrum.email = :email', { email: dealChatDto.email })
	// 		.andWhere('dicrum.dicrId = :dicrId', { dicrId: dealChatDto.dicrId })
	// 		.orderBy('dicrum.createdDt', 'DESC')
	// 		.limit(1)
	// 		.getRawOne()
	// 		.then((data) => {
	// 			return { msg: 'success', data: data };
	// 		});
	// }

	// 단체 채팅방 사용자 강퇴
	async kickUser(kickUserDto: KickUserDto) {
		const user: User = new User();
		user.email = kickUserDto.email;

		const saleItem: SaleItem = new SaleItem();
		saleItem.itemId = kickUserDto.itemId;

		const kickUser: KickUser = new KickUser();
		kickUser.user = user;
		kickUser.saleItem = saleItem;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = kickUserDto.icrId;

		const itemChatRoomUser: ItemChatRoomUser = new ItemChatRoomUser();
		itemChatRoomUser.user = user;
		itemChatRoomUser.itemChatRoom = itemChatRoom;

		return await this.itemChatRoomUserRepository
			.createQueryBuilder('icru')
			.select('icru.icruId', 'icruId')
			.addSelect('icru.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('icru.chooseYn', 'chooseYn')
			.addSelect('icru.createdDt', 'createdDt')
			.innerJoin(User, 'u', 'u.email = icru.email')
			.where('icru.email = :email', {
				email: kickUserDto.email
			})
			.andWhere('icru.icrId = :icrId', {
				icrId: kickUserDto.icrId
			})
			.getRawOne()
			.then(async (findUser) => {
				if (findUser) {
					const kickId = findUser.clientId;
					await this.kickUserRepository.insert(kickUser);

					const itemChatRoomUserMsg: ItemChatRoomUserMsg = new ItemChatRoomUserMsg();
					itemChatRoomUserMsg.user = user;
					itemChatRoomUserMsg.itemChatRoom = itemChatRoom;
					itemChatRoomUserMsg.chatMsg =
						findUser.nickname + '님이 강퇴당하셨습니다.';
					itemChatRoomUserMsg.textStatus = 'TXT03';

					await this.itemChatRoomUserMsgRepository.insert(
						itemChatRoomUserMsg
					);

					await this.itemChatRoomUserRepository.delete(
						itemChatRoomUser
					);

					const kickData = await this.itemChatRoomUserMsgRepository
						.createQueryBuilder('icrum')
						.select('icrum.icruMsgId', 'icruMsgId')
						.addSelect('icrum.email', 'email')
						.addSelect('u.nickname', 'nickname')
						.addSelect('c.codeName', 'msgType')
						.addSelect('icrum.chatMsg', 'chatMsg')
						.addSelect('icrum.createdDt', 'createdDt')
						.innerJoin(User, 'u', 'u.email = icrum.email')
						.innerJoin(Code, 'c', 'c.codeId = icrum.testStatus')
						.where('icrum.email = :email', {
							email: kickUserDto.email
						})
						.andWhere('icrum.icrId = :icrId', {
							icrId: kickUserDto.icrId
						})
						.orderBy('icrum.createdDt', 'DESC')
						.limit(1)
						.getRawOne();

					return {
						msg: 'success',
						kickId: kickId,
						kickData: kickData
					};
				}
			})
			.catch((err) => {
				return { msg: 'fail' };
			});
	}
}
