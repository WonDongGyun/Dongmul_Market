import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { ChkLoginDto } from './dto/chkLogin.dto';
import { GoogleChkEmailDto } from './dto/googleChkEmail.dto';
import { KakaoChkEmailDto } from './dto/kakaoChkEmail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dtd';
import { PasswordChangeDto } from './dto/passwordChange.dto';
import { EmailAuthDto } from './dto/emailAuth.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ErrService } from '../err/err.service';

@Injectable()
export class AccountService {
	constructor(
		private readonly jwtService: JwtService,
		private mailerService: MailerService,
		private readonly errService : ErrService,

		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@InjectRepository(EmailAuth)
		private readonly emailRepository: Repository<EmailAuth>
	) {}

	// 패스워드 해쉬화
	public async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	// jwt 토큰 만들기
	public getTokenForUser(email: string) {
		return this.jwtService.sign({
			email
		});
	}

	// 회원가입 하기
	async setUser(createUserDto: CreateUserDto) {
		try {
			const user = new User();

			user.email = createUserDto.email;
			user.password = await this.hashPassword(createUserDto.password);
			user.nickname = createUserDto.nickname;
			user.address = createUserDto.address;

			await this.emailRepository.delete({ email: createUserDto.email });
			return await this.userRepository.insert(user).then(async () => {
				// return { msg: 'success', errorMsg: '회원가입 성공!' };
				return this.errService.signUpOk();
			});
		} catch (err) {
			console.log(err);
			// return { msg: 'fail', errorMsg: ' 회원가입 실패!' };
			return this.errService.setUserErr()
		}
	}

	// 이메일 중복확인
	async chkEmail(loginUserDto: LoginUserDto) {
		try {
			return await this.userRepository.findOne({
				email: loginUserDto.email
			});
		} catch (err) {
			console.log(err);
			// return { msg: "fail", errorMsg:'이메일 중복'}
			return this.errService.existEmail();
		}
	}

	//이메일 찾기
	async findByEmail(email: string)  { //:Promise<User>
		try {
			return await this.userRepository.findOne(email);
		} catch (err) {
			console.log(err)
			// return { msg : 'fail', errorMsg:'이메일 찾기 실패'}
			return this.errService.emailChkOk()
		}
	}
	//업데이트
	async update(email: string, payload: Partial<User>) {
		try {
			return this.userRepository.update({ email: email }, payload);
		} catch (err) {
			console.log(err)
			return { msg: 'fail', errorMsg: '업데이트 실패' };
		}
	}
	//패스워드 찾기
	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const user = await this.findByEmail(forgotPasswordDto.email);
		if (!user) {
			// throw new BadRequestException('email이 없습니다.');
			return this.errService.emailChkOk();
		}
	}
	// 로그인 확인
	async chkLogin(chkLoginDto: ChkLoginDto) {
		try {
			const user = await this.userRepository.findOne({
				email: chkLoginDto.email
			});

			if (!user) {
				// return {
				// 	msg: 'fail',
				// 	errorMsg: '잘못된 이메일 혹은 비밀번호를 입력하셨습니다.'
				// };
				return this.errService.loginFail()
			}

			if (!(await bcrypt.compare(chkLoginDto.password, user.password))) {
				// return {
				// 	msg: 'fail',
				// 	errorMsg: '잘못된 이메일 혹은 비밀번호를 입력하셨습니다.'
				// };
				return this.errService.loginFail();
			}

			return {
				msg: 'success',
				email: user.email,
				nickname: user.nickname,
				token: 'bearer ' + this.getTokenForUser(user.email)
			};
		} catch (err) {
			console.log(err);
			// return { msg: 'fail', errorMsg: '로그인 실패' };
			return this.errService.loginFail();
		}
	}

	async googleCheck(googleChkEmaildto: GoogleChkEmailDto): Promise<any> {
		try {
			const google = await this.userRepository.findOne({
				email: googleChkEmaildto.email
			});
			console.log(google);
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
								token: 'bearer ' + token
							};
						} else {
							// return {
							// 	msg: 'fail',
							// 	errorMsg:
							// 		'해당 이메일이 이미 등록되어 있습니다. 로그인 방식을 확인해주세요.'
							// };
							return this.errService.existEmail();
						}
					})
					.catch((err) => {
						// return {
						// 	msg: 'fail',
						// 	errorMsg: "로그인 실패"
						// };
						return this.errService.SocialLoginFail();
					});
			} else {
				const user = new User();
				user.email = googleChkEmaildto.email;
				user.nickname =
					googleChkEmaildto.lastName + googleChkEmaildto.firstName;
				user.address = ' ';

				return await this.userRepository.save(user).then(async () => {
					// return { msg: 'success', errorMsg: '회원가입 성공!' };
					return this.errService.signUpOk();
				});
			}
		} catch (err) {
			console.log(err);
			// return { msg: 'fail', errorMsg: '회원가입 실패' };
			return this.errService.setUserErr();
		}
	}

	async kakaoCheck(kakaoChkEmaildto: KakaoChkEmailDto): Promise<any> {
		try {
			const kakao = await this.userRepository.findOne({
				email: kakaoChkEmaildto.email
			});
			console.log(kakao);
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
								token: 'bearer ' + token
							};
						} else {
							// return {
							// 	msg: 'fail',
							// 	errorMsg:
							// 		'해당 이메일이 이미 등록되어 있습니다. 로그인 방식을 확인해주세요.'
							// };
							return this.errService.existEmail()
						}
					})
					.catch((err) => {
						// return {
						// 	msg: 'fail',
						// 	errorMsg: '로그인 실패'
						// };
						return this.errService.SocialLoginFail()
					});
			} else {
				const user = new User();
				user.email = kakaoChkEmaildto.email;
				user.nickname = kakaoChkEmaildto.nickname;
				user.address = ' ';

				return await this.userRepository.save(user).then(async () => {
					// return { msg: 'success', errorMsg: '회원가입 성공!' };
					return this.errService.signUpOk();
				});
			}
		} catch (err) {
			console.log(err);
		}
	}

	//이메일 인증 코드 보내기
	async sendRegisterMail(email: string) {
		try {
			const findemail = await this.emailRepository.findOne({
				where: { email: email }
			});

			const generateRandom = function (min: number, max: number) {
				const ranNum =
					Math.floor(Math.random() * (max - min + 1)) + min;
				return ranNum;
			};

			const authNum: number = generateRandom(111111, 999999);
			const emailAuth: EmailAuth = new EmailAuth();
			emailAuth.email = email;
			emailAuth.authNum = authNum;

			await this.mailerService.sendMail({
				to: email, // list of receivers
				from: 'dongmulMarket@gmail.com', // sender address
				subject: '인증번호 입니다.', // Subject line
				html: `
					<h1>
					회원가입 요청 메일 
					</h1>
					<hr />
					<br />
					<p>안녕하세요 ${email}님 <p/>
					<br />
					<hr />
					6자리 인증 코드 :  <b> ${authNum}</b>
					<p>이 메일을 요청한 적이 없으시다면 무시하시기 바랍니다.</p>
				`
			});

			if (!findemail) {
				await this.emailRepository.insert(emailAuth);
				// return {
				// 	statusCode: 201,
				// 	message: '인증번호 전송 완료'
				// };
				return this.errService.sendEmailOk()
			} else {
				await this.emailRepository.update(email, {
					authNum: authNum
				});
				// return {
				// 	statusCode: 201,
				// 	message: '인증번호 재 전송 완료'
				// };
				return this.errService.sendEmailReOk();
			}
		} catch (err) {
			console.log(err);
		}
	}

	//인증번호 확인하고 지움
	async sendEmailConfirm(emailAuthDto: EmailAuthDto) {
		try {
			return await this.emailRepository
				.findOne({
					email: emailAuthDto.email,
					authNum: emailAuthDto.authchkNum
				})
				.then(async (findEmail) => {
					if (findEmail) {
						// return { msg: 'success' };
						return this.errService.authNumOk()
					} else {
						// return { msg: 'fail', errorMsg: '인증번호가 틀립니다.' };
						return this.errService.authNumDiffent();
					}
				});
		} catch (err) {
			console.log(err);
		}
	}

	//비밀번호 변경숫자 이메일 전송

	async sendEmailPassword(email: string) {
		try {
			const findemail = await this.userRepository.findOne(email);
			if (findemail) {
				const generateRandom = function (min: any, max: any) {
					const ranNum =
						Math.floor(Math.random() * (max - min + 1)) + min;
					return ranNum;
				};
				const authNum: number = generateRandom(111111, 999999);
				const emailAuth: EmailAuth = new EmailAuth();
				emailAuth.email = email;
				emailAuth.authNum = authNum;

				await this.mailerService.sendMail({
					to: email, // list of receivers
					from: 'ljayoon@gmail.com', // sender address
					subject: '비밀번호 찾기 인증번호 입니다.', // Subject line
					html: `
							<h1>
							비밀번호 찾기 인증번호 
							</h1>
							<hr />
							<br />
							<p>안녕하세요 ${email}님 <p/>
							<br />
							<hr />
							인증번호는 6자리 입니다. :  <b> ${authNum}</b>
							<p>이 메일을 요청한 적이 없으시다면 무시하시기 바랍니다.</p>
						`
				});
				if (findemail) {
					const find = await this.emailRepository.findOne(email);
					if (find) {
						await this.emailRepository.update(email, {
							authNum: authNum
						});
						// return {
						// 	statusCode: 201,
						// 	message: '비밀번호 인증번호  재 전송 완료'
						// };
						return this.errService.sendEmailReOk();
					} else {
						await this.emailRepository.insert(emailAuth);
						// return {
						// 	statusCode: 201,
						// 	message: '비밀번호 인증번호  전송 완료'
						// };
						return this.errService.sendEmailOk();
					}
					
				}
			}else {
					// return {
					// 	"msg": "fail",
					// 	"errorMsg": "이메일이 맞는지 확인 해주세요.!"
					// }
			}
			return this.errService.emailChkOk()
				
			} catch (err) {
			console.log(err);
		}
	}

	//비밀번호 변경
	async changePassword(passwordChangeDto: PasswordChangeDto) {
		try {
			const code = await this.emailRepository.findOne(
				passwordChangeDto.email
			)
			if (code) {
				if (code.authNum === passwordChangeDto.passwordchkNum) {
					const password = await this.hashPassword(
						passwordChangeDto.newpassword
					);

					await this.userRepository.update(passwordChangeDto.email, {
						password: password
					});
					return await this.emailRepository
						.delete({
							email: passwordChangeDto.email
						})
						.then(async () => {
							return {
								msg: '비밀번호 변경 성공!'
							};
						});
				} else {
					// return {
					// 	msg: 'fail',
					// 	errorMsg: '인증번호가 틀립니다.'
					// };
					return this.errService.authNumDiffent()
				}
			} else {
				// return {
				// 	msg: 'fail',
				// 	errorMsg: '계정을 확인 해주세요.!'
				// };
				return this.errService.emailChkOk();
			}
		} catch (err) {
			console.log(err);
		}
	}
}
