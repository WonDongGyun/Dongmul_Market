import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from 'src/entities/code.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { User } from 'src/entities/user.entity';
import { DeleteButtonDto } from 'src/domain/my-page/dto/deleteButton.dto';
import { MessageService } from 'src/global/message/message.service';
import { Repository } from 'typeorm';
import { AddressChange } from './dto/addressChange.dto';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { KickUser } from 'src/entities/kickUser.entity';

// **************************************
// * service: my-page
// * programer: DongGyun Won, JaeYoon Lee
// **************************************
@Injectable()
export class MyPageService {
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

		@InjectRepository(KickUser)
		private readonly kickUserRepository: Repository<KickUser>
	) {}
	//주소변경
	async addressChange(addressChangeDto: AddressChange) {
		return await this.userRepository
			.findOne(addressChangeDto.email)
			.then(async () => {
				if (addressChangeDto.new_address.indexOf('서울특별시') != -1) {
					addressChangeDto.new_address = addressChangeDto.new_address.replace(
						'특별시',
						''
					);
				}

				if (
					addressChangeDto.new_address.split(' ')[0].indexOf('도') !=
					-1
				) {
					const splitArr = addressChangeDto.new_address.split(' ');
					splitArr[0] = splitArr[0].replace('도', '');
					addressChangeDto.new_address =
						splitArr[0] + ' ' + splitArr[1];
				}

				const user = new User();
				user.email = addressChangeDto.email;
				user.address = addressChangeDto.new_address;

				if (user.address) {
					return await this.userRepository
						.update(addressChangeDto.email, {
							address: addressChangeDto.new_address
						})
						.then(() => {
							return this.messageService.addressChangeOk();
						})
						.catch(() => {
							return this.messageService.updateQueryErr();
						});
				} else {
					return this.messageService.addressChangeErr();
				}
			})
			.catch(() => {
				return this.messageService.findQueryErr();
			});
	}

	async getMyPost(email: string) {
		return await this.saleItemRepository
			.createQueryBuilder('si')
			.select('si.itemId', 'itemId')
			.addSelect('si.image', 'image')
			.addSelect('si.title', 'title')
			.addSelect('si.category', 'category')
			.addSelect('si.wantItem', 'wantItem')
			.addSelect('si.comment', 'comment')
			.addSelect('si.deadLine', 'deadLine')
			.addSelect('u.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('u.address', 'address')
			.addSelect('c.codeName', 'status')
			.addSelect('si.icrId', 'icrId')
			.addSelect('si.buyerEmail', 'buyerEmail')
			.addSelect('si.createdDt', 'createdDt')
			.innerJoin(User, 'u', 'si.email = u.email')
			.innerJoin(Code, 'c', 'c.codeId = si.status')
			.where('u.email = :email', { email: email })
			.orWhere('si.buyerEmail = :email', { email: email })
			.orderBy('si.createdDt', 'DESC')
			.getRawMany()
			.then(async (getPost) => {
				if (getPost) {
					return await this.saleItemRepository
						.createQueryBuilder('si')
						.select('COUNT(si.itemId)', 'postCnt')
						.where('si.email = :email', {
							email: email
						})
						.getRawOne()
						.then((postCnt) => {
							return {
								msg: 'success',
								postCnt: postCnt,
								postInfo: getPost
							};
						})
						.catch(() => {
							return this.messageService.selectQueryErr();
						});
				} else {
					return this.messageService.getMyPostErr();
				}
			})
			.catch(() => {
				return this.messageService.selectQueryErr();
			});
	}

	// 등록한 품목 삭제하기
	async deleteButton(email: string, deleteButtonDto: DeleteButtonDto) {
		return await this.saleItemRepository
			.findOne(deleteButtonDto.itemId)
			.then(async (findItem) => {
				if (findItem) {
					const user: User = new User();
					user.email = email;

					const saleItem: SaleItem = new SaleItem();
					saleItem.itemId = deleteButtonDto.itemId;
					saleItem.user = user;

					const itemChatRoom: ItemChatRoom = new ItemChatRoom();
					itemChatRoom.icrId = deleteButtonDto.icrId;

					return await this.itemChatRoomUserRepository
						.delete({
							itemChatRoom: itemChatRoom
						})
						.then(async () => {
							return await this.itemChatRoomUserMsgRepository
								.delete({
									itemChatRoom: itemChatRoom
								})
								.then(async () => {
									return await this.kickUserRepository
										.delete({ saleItem: saleItem })
										.then(async () => {
											return await this.saleItemRepository
												.delete(saleItem)
												.then(async () => {
													return await this.itemChatRoomRepository
														.delete({
															icrId:
																deleteButtonDto.icrId
														})
														.then(async () => {
															return this.messageService.returnSuccess();
														})
														.catch(() => {
															return this.messageService.deleteQueryErr();
														});
												})
												.catch(() => {
													return this.messageService.deleteQueryErr();
												});
										})
										.catch(() => {
											return this.messageService.deleteQueryErr();
										});
								})
								.catch(() => {
									return this.messageService.deleteQueryErr();
								});
						})
						.catch(() => {
							return this.messageService.deleteQueryErr();
						});
				} else {
					return this.messageService.deleteButtonErr();
				}
			})
			.catch(() => {
				return this.messageService.findQueryErr();
			});
	}
}
