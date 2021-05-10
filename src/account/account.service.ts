import {
	BadRequestException,
	Body,
	HttpService,
	Injectable
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { ChkEmailDto } from './dto/chkEmail.dto';
import { ChkLoginDto } from './dto/chkLogin.dto';
import { GoogleChkEmailDto } from './dto/googleChkEmail.dto';
import { KakaoChkEmailDto } from './dto/kakaoChkEmail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dtd';
import { PasswordChangeDto } from './dto/passwordChange.dto';

@Injectable()
export class AccountService {
	constructor(
		private readonly jwtService: JwtService,
		private mailerService: MailerService,

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
		const user = new User();

		user.email = createUserDto.email;
		user.password = await this.hashPassword(createUserDto.password);
		user.nickname = createUserDto.nickname;
		user.address = createUserDto.address;

		return await this.userRepository.save(user).then(async () => {
			return { msg: 'success', errorMsg: '회원가입 성공!' };
		});
	}

	// 이메일 중복확인
	async chkEmail(chkEmailDto: ChkEmailDto) {
		const existingUser = await this.userRepository.findOne({
			email: chkEmailDto.email
		});

		if (existingUser) {
			return { msg: 'fail', errorMsg: '이미 등록된 이메일입니다.' };
		} else {
			return { msg: 'success' };
		}
	}

	//이메일 찾기
	async findByEmail(email: string): Promise<User> {
		return await this.userRepository.findOne(email);
	}
	//업데이트
	async update(email: string, payload: Partial<User>) {
		return this.userRepository.update({ email: email }, payload);
	}
	//패스워드 찾기
	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const user = await this.findByEmail(forgotPasswordDto.email);
		if (!user) {
			throw new BadRequestException('email이 없습니다.');
		}
	}
	// 로그인 확인
	async chkLogin(chkLoginDto: ChkLoginDto) {
		const user = await this.userRepository.findOne({
			email: chkLoginDto.email
		});

		if (!user) {
			return { msg: 'fail', errorMsg: '존재하지 않는 계정입니다.' };
		}

		if (!(await bcrypt.compare(chkLoginDto.password, user.password))) {
			return {
				msg: 'fail',
				errorMsg: '잘못된 이메일 혹은 비밀번호를 입력하셨습니다.'
			};
		}

		return {
			msg: 'success',
			email: user.email,
			nickname: user.nickname,
			token: 'bearer ' + this.getTokenForUser(user.email)
		};
	}

	// 로그인 확인
	async getProfile(email: string) {
		return await this.userRepository
			.findOne({
				email: email
			})
			.then((findProfile) => {
				if (findProfile) {
					return {
						email: findProfile.email,
						nickname: findProfile.nickname,
						address: findProfile.address
					};
				}
			})
			.catch((err) => {
				return {
					msg: 'fail',
					errorMsg: '프로필 조회 중 오류가 발생하였습니다.'
				};
			});
	}

	googleLogin(req) {
		if (!req.user) {
			return 'no user from google';
		}
		return {
			message: 'User information from google',
			user: req.user
		};
	}

	// logOut(logOut: LogOut): Promise<import('./account.dto').LogOutSuccess> {
	// 	throw new Error('Method not implemented.');
	// }

	async googleCheck(googleChkEmaildto: GoogleChkEmailDto): Promise<any> {
		const google = await this.userRepository.findOne({
			email: googleChkEmaildto.email
		});
		// console.log(google)
		if (google) {
			return { msg: 'fail', errorMsg: '이미 존재하는 계정입니다.' }; //this.getTokenForUser(googleChkEmaildto.email);
		} else {
			const user = new User();
			user.email = googleChkEmaildto.email;
			user.nickname =
				googleChkEmaildto.lastName + googleChkEmaildto.firstName;
			user.address = ' ';

			return await this.userRepository.save(user).then(async () => {
				return { msg: 'success', errorMsg: '회원가입 성공!' };
			});
			// const token = this.getTokenForUser(googleChkEmaildto.email);
			// return { token: token }
		}
	}

	async findUserEmail(email: string) {
		const user = await this.userRepository.findOne({
			where: { email: email }
		});
		return user;
	}
	//이메일 인증 코드 보내기
	async sendRegisterMail(email: string) {
		const findemail = await this.emailRepository.findOne({
			where: { email: email }
		});
		try {
			if (!findemail) {
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
					from: 'ljayoon@gmail.com', // sender address
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

				console.log(findemail);
				await this.emailRepository.insert(emailAuth);
				return {
					statusCode: 201,
					message: '인증번호 전송 완료'
				};
			} else {
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
					from: 'ljayoon@gmail.com', // sender address
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

				await this.emailRepository.update(email, {
					authNum: authNum
				});
				return {
					statusCode: 201,
					message: '인증번호 재 전송 완료'
				};
			}
		} catch (err) {
			console.log(err);
		}
	}

	//인증번호 확인하고 지움
	async sendEmailConfirm(email: string, authNum: number) {
		const findemail = await this.emailRepository.findOne(email);
		console.log(findemail.authNum);
		if (authNum == findemail.authNum) {
			await this.emailRepository.delete({ email: email });
			return { msg: 'success' };
		} else {
			return { msg: 'fail' };
		}
	}

	//비밀번호 변경숫자 이메일 전송

	async sendEmailPassword(email: string) {
		const findemail = await this.userRepository.findOne(email);
		if (findemail) {
			const generateRandom = function (min: any, max: any) {
				const ranNum =
					Math.floor(Math.random() * (max - min + 1)) + min;
				return ranNum;
			};
			const newpassword: string = generateRandom(111111, 999999);
			const emailAuth: EmailAuth = new EmailAuth();
			emailAuth.email = email;
			emailAuth.newpassword = newpassword;

			await this.mailerService.sendMail({
				to: email, // list of receivers
				from: 'ljayoon@gmail.com', // sender address
				subject: '새로운 비밀번호 입니다.', // Subject line
				html: `
							<h1>
							새로운 비밀번호 
							</h1>
							<hr />
							<br />
							<p>안녕하세요 ${email}님 <p/>
							<br />
							<hr />
							새로운 비밀번호6자리 입니다. :  <b> ${newpassword}</b>
							<p>이 메일을 요청한 적이 없으시다면 무시하시기 바랍니다.</p>
						`
			});
			let newspassword = emailAuth.newpassword.toString();
			newspassword = await this.hashPassword(newspassword);
			console.log(newspassword);
			await this.userRepository.update(email, {
				password: newspassword
			});
			return {
				statusCode: 201,
				message: '비밀번호 변경 이메일 전송 완료'
			};
		} else {
			return { msg: '없는 계정입니다.' };
		}
	}
	catch(err) {
		console.log(err);
	}

	//비밀번호 변경
	async changePassword(passwordChangeDto: PasswordChangeDto) {
		const newpassword = await this.hashPassword(passwordChangeDto.password);
		// console.log(newpassword)
		return await this.userRepository
			.update(passwordChangeDto.email, { password: newpassword })
			.then(async () => {
				return { msg: 'success', errorMsg: '비밀번호 변경 성공!' };
			});
	}
}

//카카오로그인
@Injectable()
export class KakaoLogin {
	check: boolean;
	accessToken: string;
	accountemail: string;
	accountnickname: string;

	private http: HttpService;
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {
		this.check = false;
		this.http = new HttpService();
		this.accessToken = '';
		this.accountemail = '';
		this.accountnickname = '';
	}
	loginCheck(): void {
		this.check = !this.check;

		return;
	}
	async login(url: string, headers: any): Promise<any> {
		return await this.http.post(url, '', { headers }).toPromise();
	}
	setToken(token: string): boolean {
		this.accessToken = token;
		return true;
	}

	setNickName(nickname: string): boolean {
		this.accountnickname = nickname;
		return true;
	}

	async getEmail(): Promise<any> {
		const _url = 'https://kapi.kakao.com/v2/user/me';
		const _header = {
			Authorization: `bearer ${this.accessToken}`,
			'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		};
		return await this.http.post(_url, '', { headers: _header }).toPromise();
	}
	setEmail(email: string): boolean {
		this.accountemail = email;
		return true;
	}

	async logout(): Promise<any> {
		const _url = 'https://kapi.kakao.com/v1/user/logout';
		const _header = {
			Authorization: `bearer ${this.accessToken}`
		};
		return await this.http.post(_url, '', { headers: _header }).toPromise();
	}
	async deleteLog(): Promise<any> {
		const _url = 'https://kapi.kakao.com/v1/user/unlink';
		const _header = {
			Authorization: `bearer ${this.accessToken}`
		};
		return await this.http.post(_url, '', { headers: _header }).toPromise();
	}

	async kakaoCheck(kakaoChkEmaildto: KakaoChkEmailDto): Promise<any> {
		const kakao = await this.userRepository.findOne({
			email: kakaoChkEmaildto.email
		});
		// console.log(kakao);
		if (kakao) {
			return { msg: 'fail', errorMsg: '이미 존재하는 계정입니다.' }; //this.getTokenForUser(googleChkEmaildto.email);
		} else {
			const user = new User();
			user.email = kakaoChkEmaildto.email;
			user.nickname = kakaoChkEmaildto.nickname;
			user.address = ' ';

			return await this.userRepository.save(user).then(async () => {
				return { msg: 'success', errorMsg: '회원가입 성공!' };
			});
			// const token = this.getTokenForUser(googleChkEmaildto.email);
			// return { token: token }
		}
	}
}
