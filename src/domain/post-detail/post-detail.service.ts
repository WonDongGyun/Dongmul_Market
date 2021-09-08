import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { Code } from 'src/entities/code.entity';
import { KickUser } from 'src/entities/kickUser.entity';
import { MessageService } from 'src/global/message/message.service';

// **************************************
// * service: post-detail
// * programer: DongGyun Won
// **************************************
@Injectable()
export class PostDetailService {
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

	// 경매 글 상세내용
	async getPostDetail(itemId: string) {
		return await this.saleItemRepository
			.createQueryBuilder('si')
			.select('si.itemId', 'itemId')
			.addSelect('si.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('si.image', 'image')
			.addSelect('si.title', 'title')
			.addSelect('si.category', 'category')
			.addSelect('si.wantItem', 'wantItem')
			.addSelect('si.comment', 'comment')
			.addSelect(
				'DATE_FORMAT(si.deadLine, "%Y년 %m월 %d일 %H시 %i분")',
				'deadLine'
			)
			.addSelect('c.codeName', 'status')
			.addSelect('si.icrId', 'icrId')
			.addSelect('si.buyerEmail', 'buyerEmail')
			.addSelect(
				'DATE_FORMAT(si.createdDt, "%Y년 %m월 %d일 %H시 %i분")',
				'createdDt'
			)
			.innerJoin(User, 'u', 'u.email = si.email')
			.innerJoin(Code, 'c', 'c.codeId = si.status')
			.where('si.itemId = :itemId', { itemId: itemId })
			.getRawOne()
			.then((findDetail) => {
				if (findDetail) {
					return { msg: 'success', data: findDetail };
				} else {
					return this.messageService.getPostDetailErr();
				}
			})
			.catch(() => {
				return this.messageService.selectQueryErr();
			});
	}

	// 버튼 유무
	async getButton(email: string, icrId: string) {
		const user: User = new User();
		user.email = email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		itemChatRoom.icrId = icrId;

		const itemChatRoomUser: ItemChatRoomUser = new ItemChatRoomUser();
		itemChatRoomUser.user = user;
		itemChatRoomUser.itemChatRoom = itemChatRoom;

		return this.itemChatRoomUserRepository
			.findOne(itemChatRoomUser)
			.then(async (joinYn) => {
				// true 켜짐, false 꺼짐
				const button = {
					groupJoinButton: true,
					oneJoinButton: false
				};

				if (joinYn) {
					button.groupJoinButton = false;
					return { buttonYn: button };
				} else {
					return { buttonYn: button };
				}
			})
			.catch(() => {
				return this.messageService.findQueryErr();
			});
	}
}
