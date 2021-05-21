import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from 'src/entities/code.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AddressChange } from './dto/addressChange.dto';

@Injectable()
export class MyPageService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@InjectRepository(SaleItem)
		private readonly saleItemRepository: Repository<SaleItem>
	) {}
	//주소변경
	async addressChange(addressChangeDto: AddressChange) {
		try {
			const email = await this.userRepository.findOne(
				addressChangeDto.email
			);

			const user = new User();
			user.email = addressChangeDto.email;
			user.address = addressChangeDto.new_address;

			if (user.address) {
				await this.userRepository.update(addressChangeDto.email, {
					address: addressChangeDto.new_address
				});
				return { statusCode: 'success', message: '주소 변경 완료' };
			} else {
				return {
					msg: 'fail',
					errorMsg: '주소를 입력해주세요'
				};
			}
		} catch (err) {
			return {
				msg: 'fail',
				errorMsg: '주소를 입력해주세요'
			};
		}
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
			.orderBy('si.createdDt', 'DESC')
			.getRawMany()
			.then(async (getPost) => {
				const postCnt = await this.saleItemRepository
					.createQueryBuilder('si')
					.select('COUNT(si.itemId)', 'postCnt')
					.where('si.email = :email', { email: email })
					.getRawOne();
				return { msg: 'success', postCnt: postCnt, postInfo: getPost };
			})
			.catch((err) => {
				return {
					mag: 'fail',
					errorMsg: '로그인을 다시 해주시길 바랍니다.'
				};
			});
	}
}
