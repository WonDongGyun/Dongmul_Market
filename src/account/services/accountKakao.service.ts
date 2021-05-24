import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { MessageService } from 'src/message/message.service';
import { Repository } from 'typeorm';
import { KakaoChkEmailDto } from '../dto/kakaoChkEmail.dto';

// **************************************
// * service: accountKakao
// * programer: JaeYoon Lee
// **************************************
@Injectable()
export class AccountKakaoService {
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

	//카카오 로그인

	async kakaoCheck(kakaoChkEmaildto: KakaoChkEmailDto): Promise<any> {
		try {
			const kakao = await this.userRepository.findOne({
				email: kakaoChkEmaildto.email
			});
			if (kakao) {
				return await this.userRepository
					.findOne({
						email: kakaoChkEmaildto.email,
						password: null
					})
					.then((findKakao) => {
						if (findKakao) {
							const token = this.getTokenForUser(
								kakaoChkEmaildto.email
							);
							return {
								msg: 'success',
								email: findKakao.email,
								nickname: findKakao.nickname,
								address: findKakao.address,
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
				user.email = kakaoChkEmaildto.email;
				user.nickname = kakaoChkEmaildto.nickname;

				return await this.userRepository.save(user).then(async () => {
					return this.messageService.signUpOk();
				});
			}
		} catch (err) {
			console.log(err);
			return this.messageService.setUserErr();
		}
	}
}
