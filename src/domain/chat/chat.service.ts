import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { Repository } from 'typeorm';
import { ItemChatDto } from './dto/itemChat.dto';
import { ItemChatJoinDto } from './dto/itemChatJoin.dto';
import { Code } from 'src/entities/code.entity';
import { AutoJoinDto } from './dto/autoJoin.dto';
import { KickUser } from 'src/entities/kickUser.entity';
import { KickUserDto } from './dto/kickUser.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
import { MessageService } from 'src/global/message/message.service';

// **************************************
// * service: chat
// * programer: DongGyun Won
// **************************************
@Injectable()
export class ChatService {
	constructor(
		private readonly messageService: MessageService,

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

		@InjectRepository(Code)
		private readonly codeRepository: Repository<Code>,

		@InjectRepository(KickUser)
		private readonly kickUserRepository: Repository<KickUser>
	) {}

	// 현재 단체 채팅중인 사람 보여주기
	async showChatUser(autoJoin: AutoJoinDto) {
		return await this.itemChatRoomUserRepository
			.createQueryBuilder('icru')
			.select('icru.icruId', 'icruId')
			.addSelect('icru.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('icru.chooseYn', 'chooseYn')
			.addSelect(
				`CASE WHEN si.email = icru.email THEN true ELSE false END`,
				'isBoss'
			)
			.innerJoin(User, 'u', 'u.email = icru.email')
			.innerJoin(SaleItem, 'si', 'si.icrId = icru.icrId')
			.where('icru.icrId = :icrId', {
				icrId: autoJoin.icrId
			})
			.getRawMany()
			.then((groupChatUserList) => {
				if (groupChatUserList) {
					return groupChatUserList;
				} else {
					return this.messageService.showChatUserErr();
				}
			})
			.catch(() => {
				return this.messageService.selectQueryErr();
			});
	}

	// 채팅방 사용자 테이블에 해당 사용자가 이미 등록되어 있다면 자동으로 join
	async joinAuto(autoJoin: AutoJoinDto, clientId: string) {
		const user: User = new User();
		user.email = autoJoin.email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = autoJoin.icrId;

		return this.itemChatRoomUserRepository
			.findOne({
				user: user,
				itemChatRoom: itemChatRoom
			})
			.then(async (findUser) => {
				if (findUser) {
					return await this.itemChatRoomUserRepository
						.update(findUser.icruId, {
							clientId: clientId
						})
						.then(() => {
							return { msg: 'success', findUser };
						})
						.catch(() => {
							return this.messageService.updateQueryErr();
						});
				}
			})
			.catch(() => {
				return this.messageService.findQueryErr();
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
						.getRawMany()
						.then((groupChatList) => {
							if (groupChatList) {
								return groupChatList;
							} else {
								return this.messageService.showChatUserErr();
							}
						})
						.catch(() => {
							return this.messageService.selectQueryErr();
						});
				}
			})
			.catch(() => {
				return this.messageService.selectQueryErr();
			});
	}

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
								return await this.itemChatRoomUserMsgRepository
									.insert(itemChatRoomUserMsg)
									.then(async () => {
										return await this.itemChatRoomUserMsgRepository
											.createQueryBuilder('icrum')
											.select(
												'icrum.icruMsgId',
												'icruMsgId'
											)
											.addSelect('icrum.email', 'email')
											.addSelect('u.nickname', 'nickname')
											.addSelect('c.codeName', 'msgType')
											.addSelect(
												'icrum.chatMsg',
												'chatMsg'
											)
											.addSelect(
												'icrum.createdDt',
												'createdDt'
											)
											.innerJoin(
												User,
												'u',
												'u.email = icrum.email'
											)
											.innerJoin(
												Code,
												'c',
												'c.codeId = icrum.textStatus'
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
											.then((findMsgList) => {
												if (findMsgList) {
													return {
														msg: 'success',
														data: findMsgList
													};
												} else {
													return this.messageService.chatRoomMsgErr();
												}
											})
											.catch(() => {
												return this.messageService.selectQueryErr();
											});
									})
									.catch(() => {
										return this.messageService.insertQueryErr();
									});
							}
						})
						.catch(() => {
							return this.messageService.selectQueryErr();
						});
				}
			})
			.catch(() => {
				return this.messageService.insertQueryErr();
			});
	}

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
		return await this.itemChatRoomUserMsgRepository
			.insert(itemChatRoomUserMsg)
			.then(async () => {
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
					.where('icrum.email = :email', {
						email: itemChatDto.email
					})
					.andWhere('icrum.icrId = :icrId', {
						icrId: itemChatDto.icrId
					})
					.orderBy('icrum.createdDt', 'DESC')
					.limit(1)
					.getRawOne()
					.then((findMsgList) => {
						if (findMsgList) {
							return {
								msg: 'success',
								data: findMsgList
							};
						} else {
							return this.messageService.chatRoomMsgErr();
						}
					})
					.catch(() => {
						return this.messageService.selectQueryErr();
					});
			})
			.catch(() => {
				return this.messageService.insertQueryErr();
			});
	}

	// 단체 채팅방 교환 성립
	async exchange(exchangeDto: ExchangeDto) {
		const user: User = new User();
		user.email = exchangeDto.hostEmail;

		return await this.saleItemRepository
			.findOne({
				user: user,
				itemId: exchangeDto.itemId
			})
			.then(async (findItem) => {
				if (findItem) {
					return await this.saleItemRepository
						.update(exchangeDto.itemId, {
							status: 'SI02',
							buyerEmail: exchangeDto.consumerEmail
						})
						.then(() => {
							return this.messageService.returnSuccess();
						})
						.catch(() => {
							return this.messageService.updateQueryErr();
						});
				}
			})
			.catch(() => {
				return this.messageService.findQueryErr();
			});
	}

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
			.addSelect('icru.clientId', 'clientId')
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

					await this.kickUserRepository.insert(kickUser).catch(() => {
						return this.messageService.insertQueryErr();
					});

					const itemChatRoomUserMsg: ItemChatRoomUserMsg = new ItemChatRoomUserMsg();
					itemChatRoomUserMsg.user = user;
					itemChatRoomUserMsg.itemChatRoom = itemChatRoom;
					itemChatRoomUserMsg.chatMsg =
						findUser.nickname + '님이 강퇴당하셨습니다.';
					itemChatRoomUserMsg.textStatus = 'TXT03';

					await this.itemChatRoomUserMsgRepository
						.insert(itemChatRoomUserMsg)
						.catch(() => {
							return this.messageService.insertQueryErr();
						});

					await this.itemChatRoomUserRepository
						.delete(itemChatRoomUser)
						.catch(() => {
							return this.messageService.deleteQueryErr();
						});

					const kickData = await this.itemChatRoomUserMsgRepository
						.createQueryBuilder('icrum')
						.select('icrum.icruMsgId', 'icruMsgId')
						.addSelect('icrum.email', 'email')
						.addSelect('u.nickname', 'nickname')
						.addSelect('c.codeName', 'msgType')
						.addSelect('icrum.chatMsg', 'chatMsg')
						.addSelect('icrum.createdDt', 'createdDt')
						.innerJoin(User, 'u', 'u.email = icrum.email')
						.innerJoin(Code, 'c', 'c.codeId = icrum.textStatus')
						.where('icrum.email = :email', {
							email: kickUserDto.email
						})
						.andWhere('icrum.icrId = :icrId', {
							icrId: kickUserDto.icrId
						})
						.orderBy('icrum.createdDt', 'DESC')
						.limit(1)
						.getRawOne()
						.catch(() => {
							return this.messageService.selectQueryErr();
						});
					return {
						msg: 'success',
						kickId: kickId,
						kickData: kickData
					};
				} else {
					return this.messageService.chatRoomMsgErr();
				}
			})
			.catch(() => {
				return this.messageService.selectQueryErr();
			});
	}
}
