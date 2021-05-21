import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginUserDto } from '../dto/login-user.dto';
import { ChkLoginDto } from '../dto/chkLogin.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dtd';
import { EmailAuthDto } from '../dto/emailAuth.dto';
import { PasswordChangeDto } from '../dto/passwordChange.dto';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class AccountNormalService {
	constructor(
		private readonly jwtService: JwtService,
		private mailerService: MailerService,
		private readonly messageService: MessageService,

		@InjectRepository(User)
		private readonly userRepository: Repository<User>,

		@InjectRepository(EmailAuth)
		private readonly emailRepository: Repository<EmailAuth>
	) {}

	// 패스워드 해쉬화
	public async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

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
				return this.messageService.signUpOk();
			});
		} catch (err) {
			console.log(err);
			return this.messageService.setUserErr();
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
			return this.messageService.existEmail();
		}
	}

	//이메일 찾기
	async findByEmail(email: string) {
		try {
			return await this.userRepository.findOne(email);
		} catch (err) {
			console.log(err);
			return this.messageService.emailChkOk();
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

	// 로그인 확인
	async chkLogin(chkLoginDto: ChkLoginDto) {
		try {
			const user = await this.userRepository.findOne({
				email: chkLoginDto.email
			});

			if (!user) {
				return this.messageService.loginFail();
			}

			if (!(await bcrypt.compare(chkLoginDto.password, user.password))) {
				return this.messageService.loginFail();
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
			return this.messageService.loginFail();
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
				template: '../dongmul/src/template/html/emailAuthNum.hbs',
				context: {
					code: authNum,
					username: email
				}
			});

			if (!findemail) {
				await this.emailRepository.insert(emailAuth);
				return this.messageService.sendEmailOk();
			} else {
				await this.emailRepository.update(email, {
					authNum: authNum
				});
				return this.messageService.sendEmailReOk();
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
						return this.messageService.authNumOk();
					} else {
						return this.messageService.authNumDiffent();
					}
				});
		} catch (err) {
			console.log(err);
		}
	}

	//패스워드 찾기
	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const user = await this.findByEmail(forgotPasswordDto.email);
		if (!user) {
			return this.messageService.emailChkOk();
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
						'../dongmul/src/template/html/passwordAuthNum.hbs',
					context: {
						code: authNum,
						username: email
					}
				});
				if (findemail) {
					const find = await this.emailRepository.findOne(email);
					if (find) {
						await this.emailRepository.update(email, {
							authNum: authNum
						});
						return this.messageService.sendEmailReOk();
					} else {
						await this.emailRepository.insert(emailAuth);
						return this.messageService.sendEmailOk();
					}
				}
			} else {
			}
			return this.messageService.emailChkOk();
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
							return this.messageService.passwordChangeOk();
						});
				} else {
					return this.messageService.authNumDiffent();
				}
			} else {
				return this.messageService.emailChkOk();
			}
		} catch (err) {
			console.log(err);
		}
	}
}