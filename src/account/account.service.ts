import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChkLoginDto } from './dto/chkLogin.dto';
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
		private readonly errService: ErrService,

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


	// 이메일 중복확인
	async chkEmail(loginUserDto: LoginUserDto) {
		try {
			return await this.userRepository.findOne({
				email: loginUserDto.email
			});
		} catch (err) {
			console.log(err);
			return this.errService.existEmail();
		}
	}

	//이메일 찾기
	async findByEmail(email: string) {
		try {
			return await this.userRepository.findOne(email);
		} catch (err) {
			console.log(err);
			return this.errService.emailChkOk();
		}
	}
	//업데이트
	async update(email: string, payload: Partial<User>) {
		try {
			return this.userRepository.update({ email: email }, payload);
		} catch (err) {
			console.log(err);
			return { msg: 'fail', errorMsg: '업데이트 실패' };
		}
	}
	//패스워드 찾기
	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const user = await this.findByEmail(forgotPasswordDto.email);
		if (!user) {
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
				return this.errService.loginFail();
			}

			if (!(await bcrypt.compare(chkLoginDto.password, user.password))) {
				return this.errService.loginFail();
			}

			console.log(this.getTokenForUser(user.email));

			return {
				msg: 'success',
				email: user.email,
				nickname: user.nickname,
				token: 'bearer ' + this.getTokenForUser(user.email)
			};
		} catch (err) {
			console.log(err);
			return this.errService.loginFail();
		}
	}

	//이메일 인증 코드 보내기
	//가입된 이메일을 찾아서 랜덤함수로 이메일을 보낸후 email auth에 저장 업데이트
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
				to: email,
				from: 'dongmulMarket@gmail.com',
				subject: ' 이메일 인증번호 입니다.',
				template: '../dongmul/src/template/emailAuthNum.hbs',
				context: {
					code: authNum,
					username: email
				},
				// html: `
				// 	<h1>
				// 	회원가입 요청 메일 
				// 	</h1>
				// 	<hr />
				// 	<br />
				// 	<p>안녕하세요 ${email}님 <p/>
				// 	<br />
				// 	<hr />
				// 	6자리 인증 코드 :  <b> ${authNum}</b>
				// 	<p>이 메일을 요청한 적이 없으시다면 무시하시기 바랍니다.</p>
				// `
			});

			if (!findemail) {
				await this.emailRepository.insert(emailAuth);
				return this.errService.sendEmailOk();
			} else {
				await this.emailRepository.update(email, {
					authNum: authNum
				});
				return this.errService.sendEmailReOk();
			}
		} catch (err) {
			console.log(err);
		}
	}

	//email auth에 저장된 이메일 인증번호 찾음
	async sendEmailConfirm(emailAuthDto: EmailAuthDto) {
		try {
			return await this.emailRepository
				.findOne({
					email: emailAuthDto.email,
					authNum: emailAuthDto.authchkNum
				})
				.then(async (findEmail) => {
					if (findEmail) {
						return this.errService.authNumOk();
					} else {
						return this.errService.authNumDiffent();
					}
				});
		} catch (err) {
			console.log(err);
		}
	}

	//비밀번호 변경숫자 이메일 전송
	//계정 찾고 랜덤함수 후 이메일 전송 email_auth에 있으면 업데이트

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
					to: email,
					from: 'dongmulMarket@gmail.com',
					subject: ' 비밀번호 인증번호 입니다.',
					template:
						'../dongmul/src/template/passwordAuthNum.hbs',
					context: {
						code: authNum,
						username: email
					}
					// html: `
					// 		<h1>
					// 		비밀번호 찾기 인증번호
					// 		</h1>
					// 		<hr />
					// 		<br />
					// 		<p>안녕하세요 ${email}님 <p/>
					// 		<br />
					// 		<hr />
					// 		인증번호는 6자리 입니다. :  <b> ${authNum}</b>
					// 		<p>이 메일을 요청한 적이 없으시다면 무시하시기 바랍니다.</p>
					// 	`
				});
				if (findemail) {
					const find = await this.emailRepository.findOne(email);
					if (find) {
						await this.emailRepository.update(email, {
							authNum: authNum
						});
						return this.errService.sendEmailReOk();
					} else {
						await this.emailRepository.insert(emailAuth);
						return this.errService.sendEmailOk();
					}
				}
			} else {
			}
			return this.errService.emailChkOk();
		} catch (err) {
			console.log(err);
		}
	}

	//비밀번호 변경
	//email_auth에 있으면 실행 변경할 비밀번호가 새로운 비밀번호와 서로 일치하면 비밀번호 변경
	async changePassword(passwordChangeDto: PasswordChangeDto) {
		try {
			const code = await this.emailRepository.findOne(
				passwordChangeDto.email
			);
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
					return this.errService.authNumDiffent();
				}
			} else {
				return this.errService.emailChkOk();
			}
		} catch (err) {
			console.log(err);
		}
	}
}
