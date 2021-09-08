import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { MessageService } from 'src/global/message/message.service';
import { Repository } from 'typeorm';
import { GoogleChkEmailDto } from '../dto/googleChkEmail.dto';

// **************************************
// * service: accountGoogle
// * programer: JaeYoon Lee
// **************************************
@Injectable()
export class AccountGoogleService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly messageService: MessageService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	// jwt 토큰 만들기
	public getTokenForUser(email: string) {
		return this.jwtService.sign({
			email
		});
	}

	//구글 로그인
	async googleCheck(googleChkEmaildto: GoogleChkEmailDto): Promise<any> {
		try {
			const google = await this.userRepository.findOne({
				email: googleChkEmaildto.email
			});
			if (google) {
				return await this.userRepository
					.findOne({
						email: googleChkEmaildto.email,
						password: null
					})
					.then((findGoogle) => {
						if (findGoogle) {
							const token = this.getTokenForUser(
								googleChkEmaildto.email
							);
							return {
								msg: 'success',
								email: findGoogle.email,
								nickname: findGoogle.nickname,
								address: findGoogle.address,
								token: 'bearer ' + token
							};
						} else {
							return this.messageService.existEmail();
						}
					})
					.catch((err) => {
						return this.messageService.socialLoginFail();
					});
			} else {
				const user = new User();
				user.email = googleChkEmaildto.email;
				user.nickname =
					googleChkEmaildto.lastName + googleChkEmaildto.firstName;

				return await this.userRepository.save(user).then(async () => {
					return this.messageService.signUpOk();
				});
			}
		} catch (err) {
			return this.messageService.setUserErr();
		}
	}
}
