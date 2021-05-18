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
import { DeleteButtonDto } from './dto/deleteButton.dto';
import { KickUser } from 'src/entities/kickUser.entity';

@Injectable()
export class MainPageService {
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

	// 메인 화면
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
			.andWhere('now() < si.deadLine')
			.orderBy('si.deadLine', 'DESC')
			.getRawMany()
			.then((getPost) => {
				return { msg: 'success', data: getPost };
			})
			.catch((err) => {
				return {
					msg: 'fail',
					errorMsg: '로그인을 다시 해주시길 바랍니다.'
				};
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
			.orderBy('si.deadLine', 'DESC')
			.getRawMany()
			.then((data) => {
				return { msg: 'success', data: data };
			})
			.catch((err) => {
				return {
					msg: 'fail',
					errorMsg: '로그인을 다시 해주시길 바랍니다.'
				};
			});
	}

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
					return {
						msg: 'fail',
						errorMsg: 'itemId를 다시 확인해주세요.'
					};
				}
			})
			.catch(() => {
				return {
					msg: 'fail',
					errorMsg: '로그인을 다시 해주시길 바랍니다.'
				};
			});
	}

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
		await this.itemChatRoomRepository.insert(itemChatRoom);

		// 경매 글 올린 사람, 채팅방 유저로 저장
		const itemChatRoomUser: ItemChatRoomUser = new ItemChatRoomUser();
		itemChatRoomUser.user = user;
		itemChatRoomUser.itemChatRoom = itemChatRoom;
		itemChatRoomUser.chooseYn = 'Y';
		await this.itemChatRoomUserRepository.insert(itemChatRoomUser);

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
				return { msg: 'success' };
			})
			.catch((err) => {
				return {
					msg: 'fail',
					errorMsg: '경매 물건을 등록하던 중 오류가 발생하였습니다.'
				};
			});
	}

	// 등록한 품목 삭제하기
	async deleteButton(email: string, deleteButtonDto: DeleteButtonDto) {
		try {
			const id = await this.saleItemRepository.findOne(
				deleteButtonDto.itemId
			);
			if (id) {
				await this.saleItemRepository.delete({
					itemId: deleteButtonDto.itemId
				});
				return { msg: 'success' };
			} else {
				return {
					msg: 'fail',
					errorMsg: 'itemId가 다릅니다.'
				};
			}
		} catch (err) {
			console.log(err);
		}
	}
}
