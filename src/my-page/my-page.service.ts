import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Code } from 'src/entities/code.entity';
import { SaleItem } from 'src/entities/saleItem.entity';
import { User } from 'src/entities/user.entity';
import { DeleteButtonDto } from 'src/main-page/dto/deleteButton.dto';
import { MessageService } from 'src/message/message.service';
import { Repository } from 'typeorm';
import { AddressChange } from './dto/addressChange.dto';

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
		private readonly saleItemRepository: Repository<SaleItem>
	) {}
	//주소변경
	async addressChange(addressChangeDto: AddressChange) {
		const email = await this.userRepository
			.findOne(addressChangeDto.email)
			.catch(() => {
				return this.messageService.findQueryErr();
			});

		const user = new User();
		user.email = addressChangeDto.email;
		user.address = addressChangeDto.new_address;

		if (user.address) {
			await this.userRepository
				.update(addressChangeDto.email, {
					address: addressChangeDto.new_address
				})
				.catch(() => {
					return this.messageService.updateQueryErr();
				});
			return this.messageService.addressChangeOk();
		} else {
			return this.messageService.addressChangeErr();
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
		await this.saleItemRepository
			.findOne(deleteButtonDto.itemId)
			.then(async (findItem) => {
				if (findItem) {
					console.log(findItem);
					const saleItem: SaleItem = new SaleItem();
					saleItem.itemId = deleteButtonDto.itemId;

					await this.saleItemRepository.delete(saleItem).catch(() => {
						return this.messageService.deleteQueryErr();
					});
					return this.messageService.returnSuccess();
				} else {
					return this.messageService.deleteButtonErr();
				}
			})
			.catch(() => {
				return this.messageService.findQueryErr();
			});
	}
}
