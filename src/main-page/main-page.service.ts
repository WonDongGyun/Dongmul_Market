import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { User } from 'src/entities/user.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { Code } from 'src/entities/code.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { ItemChatRoomUser } from 'src/entities/itemChatRoomUser.entity';
import { ItemChatRoomUserMsg } from 'src/entities/itemChatRoomUserMsg.entity';
import { Repository } from 'typeorm';
import { SetItemDto } from './dto/setItem.dto';
import { KickUser } from 'src/entities/kickUser.entity';
import { MessageService } from 'src/message/message.service';

// **************************************
// * service: main-page
// * programer: DongGyun Won
// **************************************
@Injectable()
export class MainPageService {
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

	//s3 접속 키
	getS3() {
		return new S3({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
		});
	}

	// s3 파일 업로드
	async uploadS3(file, bucket, name) {
		const s3 = this.getS3();
		const params = {
			Bucket: bucket,
			Key: String(name),
			Body: file
		};
		return new Promise((resolve, reject) => {
			s3.upload(params, (err, data) => {
				if (err) {
					Logger.error(err);
					reject(err.message);
				}
				resolve(data);
			});
		});
	}

	// 로그인 했을 경우의 메인 화면
	// 강퇴당한 여부를 알 수 있음.
	async getPostList(email: string) {
		const userData = await this.userRepository.findOne({ email: email });
		return await this.saleItemRepository
			.createQueryBuilder('si')
			.select('u.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('u.address', 'address')
			.addSelect('si.itemId', 'itemId')
			.addSelect('si.image', 'image')
			.addSelect('si.title', 'title')
			.addSelect('si.category', 'category')
			.addSelect('si.wantItem', 'wantItem')
			.addSelect('si.comment', 'comment')
			.addSelect('si.deadLine', 'deadLine')
			.addSelect('c.codeName', 'status')
			.addSelect('si.icrId', 'icrId')
			.addSelect('si.buyerEmail', 'buyerEmail')
			.addSelect('si.createdDt', 'createdDt')
			.addSelect(
				`IF(CASE WHEN ku.email = '${userData.email}' THEN true ELSE false END, 'true', 'false')`,
				'kickYn'
			)
			.innerJoin(User, 'u', 'si.email = u.email')
			.innerJoin(Code, 'c', 'c.codeId = si.status')
			.leftJoin(KickUser, 'ku', 'ku.itemId = si.itemId')
			.where('u.address = :address', { address: userData.address })
			.andWhere(`si.status = 'SI01'`)
			.andWhere('now() < si.deadLine')
			.orderBy('si.deadLine', 'DESC')
			.getRawMany()
			.then((getPost) => {
				if (getPost) {
					return { msg: 'success', data: getPost };
				} else {
					return this.messageService.getPostListErr();
				}
			})
			.catch(() => {
				return this.messageService.selectQueryErr();
			});
	}

	// 로그인을 하지 않은 경우 메인 화면
	async noLoginGetPost() {
		return await this.saleItemRepository
			.createQueryBuilder('si')
			.select('u.email', 'email')
			.addSelect('u.nickname', 'nickname')
			.addSelect('u.address', 'address')
			.addSelect('si.itemId', 'itemId')
			.addSelect('si.image', 'image')
			.addSelect('si.title', 'title')
			.addSelect('si.category', 'category')
			.addSelect('si.wantItem', 'wantItem')
			.addSelect('si.comment', 'comment')
			.addSelect('si.deadLine', 'deadLine')
			.addSelect('c.codeName', 'status')
			.addSelect('si.icrId', 'icrId')
			.addSelect('si.buyerEmail', 'buyerEmail')
			.addSelect('si.createdDt', 'createdDt')
			.innerJoin(User, 'u', 'si.email = u.email')
			.innerJoin(Code, 'c', 'c.codeId = si.status')
			.where('now() < si.deadLine')
			.andWhere(`si.status = 'SI01'`)
			.orderBy('si.deadLine', 'DESC')
			.getRawMany()
			.then((getPost) => {
				if (getPost) {
					return { msg: 'success', data: getPost };
				} else {
					return this.messageService.getPostListErr();
				}
			})
			.catch(() => {
				return this.messageService.selectQueryErr();
			});
	}

	// 경매 글 작성
	async writePost(setItemDto: SetItemDto, file, email: string) {
		const { originalname } = file;
		const bucketS3 = 'dongmulbucket';
		const uploadFile = await this.uploadS3(
			file.buffer,
			bucketS3,
			originalname
		);

		const user: User = new User();
		user.email = email;

		// 채팅방 만들기
		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		await this.itemChatRoomRepository.insert(itemChatRoom).catch(() => {
			return this.messageService.insertQueryErr();
		});

		// 경매 글 올린 사람, 채팅방 유저로 저장
		const itemChatRoomUser: ItemChatRoomUser = new ItemChatRoomUser();
		itemChatRoomUser.user = user;
		itemChatRoomUser.itemChatRoom = itemChatRoom;
		itemChatRoomUser.chooseYn = 'Y';
		await this.itemChatRoomUserRepository
			.insert(itemChatRoomUser)
			.catch(() => {
				return this.messageService.insertQueryErr();
			});

		// 경매 글 저장
		const saleItem: SaleItem = new SaleItem();
		saleItem.image = uploadFile['Location'];
		saleItem.title = setItemDto.title;
		saleItem.category = setItemDto.category;
		saleItem.wantItem = setItemDto.wantItem;
		saleItem.comment = setItemDto.comment;
		saleItem.deadLine = new Date(setItemDto.deadLine);
		saleItem.itemChatRoom = itemChatRoom;
		saleItem.user = user;

		return await this.saleItemRepository
			.insert(saleItem)
			.then(() => {
				return this.messageService.returnSuccess();
			})
			.catch(() => {
				return this.messageService.insertQueryErr();
			});
	}
}
