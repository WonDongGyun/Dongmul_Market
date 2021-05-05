import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Code } from 'src/entities/code.entity';
import { DealChatRoom } from 'src/entities/dealChatRoom.entity';
import { ItemChatRoom } from 'src/entities/itemChatRoom.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SetItemDto } from './dto/setItem.dto';

@Injectable()
export class MainPageService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@InjectRepository(SaleItem)
		private readonly saleItemRepository: Repository<SaleItem>,

		@InjectRepository(ItemChatRoom)
		private readonly itemChatRoomRepository: Repository<ItemChatRoom>,

		@InjectRepository(DealChatRoom)
		private readonly dealChatRoomRepository: Repository<DealChatRoom>,

		@InjectRepository(Code)
		private readonly codeRepository: Repository<Code>
	) {}

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
	async getItem(email: string) {
		const location = await this.userRepository.findOne({ email: email });
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
			.addSelect('si.dicrId', 'dicrId')
			.addSelect('si.buyerEmail', 'buyerEmail')
			.addSelect('si.createdDt', 'createdDt')
			.innerJoin(User, 'u', 'si.email = u.email')
			.innerJoin(Code, 'c', 'c.codeId = si.status')
			.where('u.address = :address', { address: location.address })
			.orderBy('si.deadLine', 'DESC')
			.getRawMany()
			.then((data) => {
				return { mag: 'success', data: data };
			})
			.catch((err) => {
				return {
					mag: 'fail',
					errorMsg: err
				};
			});
	}

	// 로그인을 하지 않은 경우 메인 화면
	async noLoginGetItem() {
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
			.addSelect('si.dicrId', 'dicrId')
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
					errorMsg: err
				};
			});
	}

	// 경매 글 상세내용
	async getDetail(itemId: string) {
		return await this.saleItemRepository
			.createQueryBuilder('si')
			.select('si.itemId', 'itemId')
			.addSelect('si.email', 'email')
			.addSelect('si.image', 'image')
			.addSelect('si.title', 'title')
			.addSelect('si.category', 'category')
			.addSelect('si.wantItem', 'wantItem')
			.addSelect('si.comment', 'comment')
			.addSelect('si.deadLine', 'deadLine')
			.addSelect('c.codeName', 'status')
			.addSelect('si.icrId', 'icrId')
			.addSelect('si.dicrId', 'dicrId')
			.addSelect('si.buyerEmail', 'buyerEmail')
			.addSelect('si.createdDt', 'createdDt')
			.innerJoin(Code, 'c', 'c.codeId = si.status')
			.where('si.itemId = :itemId', { itemId: itemId })
			.getRawOne()
			.then((findDetail) => {
				return { msg: 'success', data: findDetail };
			})
			.catch(() => {
				return {
					msg: 'fail',
					errorMsg: '해당 글의 상세 내용을 확인할 수 없습니다.'
				};
			});
	}

	// 경매 글 작성
	async setItem(setItemDto: SetItemDto, file, email: string) {
		const { originalname } = file;
		const bucketS3 = 'dongmulbucket';
		const uploadFile = await this.uploadS3(
			file.buffer,
			bucketS3,
			originalname
		);

		const user: User = new User();
		user.email = email;

		const itemChatRoom: ItemChatRoom = new ItemChatRoom();
		await this.itemChatRoomRepository.insert(itemChatRoom);

		const dealChatRoom: DealChatRoom = new DealChatRoom();
		await this.dealChatRoomRepository.insert(dealChatRoom);

		const saleItem: SaleItem = new SaleItem();
		saleItem.image = uploadFile['Location'];
		saleItem.title = setItemDto.title;
		saleItem.category = setItemDto.category;
		saleItem.wantItem = setItemDto.wantItem;
		saleItem.comment = setItemDto.comment;
		saleItem.deadLine = new Date(setItemDto.deadLine);
		saleItem.itemChatRoom = itemChatRoom;
		saleItem.dealChatRoom = dealChatRoom;
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
}
