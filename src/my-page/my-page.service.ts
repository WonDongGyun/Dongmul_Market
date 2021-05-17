import { Injectable,  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AddressChange } from './dto/addressChange.dto';

@Injectable()
export class MyPageService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}
//주소변경
    async addressChange(addressChangeDto: AddressChange) {
        try {
            const email = await this.userRepository.findOne(addressChangeDto.email)
            // console.log(email)
            const user = new User()
            user.email = addressChangeDto.email
            user.address = addressChangeDto.new_address
            // console.log(user.address)
            if (user.address) {
                await this.userRepository.update(addressChangeDto.email, { address: addressChangeDto.new_address })
                return { msg: 'success', message: '주소 변경 완료' };
            } else {
                return {
					msg: 'success',
					errorMsg: '정확한 주소를 입력해주세요'
				};
            }
        } catch (err) {
            console.log(err)
        }
    }
}
