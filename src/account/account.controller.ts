import {
	Body,
	Controller,
	Get,
	Header,
	Param,
	Post,
	Query,
	Req,
	Res,
	UseGuards
} from '@nestjs/common';
import { AccountGuardJwt } from '../guard/account.guard.jwt';
import { AccountService, KakaoLogin } from './account.service';
import { CurrentUser } from './current-account.decorator';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create.user.dto';
import { ChkEmailDto } from './dto/chkEmail.dto';
import { ChkLoginDto } from './dto/chkLogin.dto';
import { GoogleChkEmailDto } from './dto/googleChkEmail.dto';
import { KakaoChkEmailDto } from './dto/kakaoChkEmail.dto';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { ChkNumdto } from './dto/chkNum.dto';
import { ValidationPipe } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dtd';
import { PasswordChangeDto } from './dto/passwordChange.dto';


@Controller('account')
export class AccountController {
	constructor(
		private readonly accountService: AccountService,
		private readonly kakaoLogin: KakaoLogin // private readonly mailService: MailService
	) {}

	// 회원 가입
	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.accountService.setUser(createUserDto);
	}

	// 이메일 중복확인
	@Post('chkEmail')
	chkEmail(@Body() chkEmailDto: ChkEmailDto) {
		return this.accountService.chkEmail(chkEmailDto);
	}

	// 기본 로그인
	@Post('login')
	chkLogin(@Body() chkLoginDto: ChkLoginDto) {
		return this.accountService.chkLogin(chkLoginDto);
	}

	// 프로필 조회
	@Get('profile')
	@UseGuards(AccountGuardJwt)
	getProfile(@CurrentUser() email: string) {
		return this.accountService.getProfile(email);
	}

	// 구글 로그인으로 이동
	@Get('google')
	@UseGuards(AuthGuard('google'))
	googleAuth(@Req() req) {}

	// 구글 로그인 성공시, 사용자 정보 가져오기
	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	googleAuthRedirect(@Req() req) {
		return this.accountService.googleLogin(req);
	}

	//구글로그인 확인
	@Post('/googleAuth')
	GoogleAuthCheck(@Body() googleChkEmaildto: GoogleChkEmailDto) {
		return this.accountService.googleCheck(googleChkEmaildto);
	}

	@Post('mail')
	async mail(@Body() userData: LoginUserDto) {
		console.log(userData);
		const user = await this.accountService.findUserEmail(userData.email);

		if (!user) {
			const CodeEmail = await this.accountService.sendRegisterMail(
				userData.email
			);
			console.log(
				`email ID ${userData.email} not found 인증번호 메일 요청했습니다`
			);
			return CodeEmail;
		} else {
			console.log('이미 있는 계정입니다.');
		}
	}

	@Post('mail/check')
	async mailcheck(@Body() chkNum: ChkNumdto) {
		return await this.accountService.sendEmailConfirm(
			chkNum.email,
			chkNum.authchkNum
		);
	}

	// 로그아웃
	//   @Post('logout')
	// async logOut(@Body() logOut: LogOut): Promise<LogOutSuccess> {
	//   return this.authService.logOut(logOut);
	// }

	@Get('logout')
	@UseGuards(AuthGuard('jwt'))
	logout(@Req() req, @Res() res) {
		req.logout();
		res.json({ loggedOut: true });
	}

	@Post('/sendpassword')
	async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
		return await this.accountService.sendEmailPassword(
			forgotPassword.email
		);
	}

	@Post('/changepassword')
	async changePassword(@Body() passwordChangeDto: PasswordChangeDto) {
		return await this.accountService.changePassword(
			passwordChangeDto
		);
	}

	//카카오 시작
	@Get('kakaoLogin')
	@Header('Content-Type', 'text/html')
	getKakaoLoginPage(): string {
		return `
      <div>
        <h1>카카오 로그인</h1>

        <form action="/account/kakaoLoginLogic" method="GET">
          <input type="submit" value="카카오로그인" />
        </form>

        <form action="/account/kakaoLogout" method="GET">
          <input type="submit" value="카카오로그아웃 및 연결 끊기" />
        </form>

                <form action="/account/kakaoEmail" method="GET">
          <input type="submit" value="사용자정보" />
        </form>
      </div>
    `;
	}

	@Get('kakaoLoginLogic')
	@Header('Content-Type', 'text/html')
	kakaoLoginLogic(@Res() res): void {
		// console.log(res)
		const _hostName = 'https://kauth.kakao.com';
		const _restApiKey = '7c935b2dc124b8b524cdc202052f93a1'; // * 입력필요
		// 카카오 로그인 RedirectURI 등록
		const _redirectUrl =
			'http://127.0.0.1:3000/account/kakaoLoginLogicRedirect';
		const url = `${_hostName}/oauth/authorize?client_id=${_restApiKey}&redirect_uri=${_redirectUrl}&response_type=code&scope=`;
		//동의항목 이메일선택 가능
		return res.redirect(url);
	}

	@Get('kakaoLoginLogicRedirect')
	@Header('Content-Type', 'text/html')
	kakaoLoginLogicRedirect(@Query() qs, @Res() res): void {
		const _restApiKey = '7c935b2dc124b8b524cdc202052f93a1'; // * 입력필요
		const _redirect_uri =
			'http://127.0.0.1:3000/account/kakaoLoginLogicRedirect';
		const _hostName = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${_restApiKey}&redirect_uri=${_redirect_uri}&code=${qs.code}&scope=`;
		const _headers = {
			headers: {
				'Content-Type':
					'application/x-www-form-urlencoded;charset=utf-8'
			}
		};
		this.kakaoLogin
			.login(_hostName, _headers)
			.then((e) => {
				console.log(`TOKEN : ${e.data['access_token']}`);
				this.kakaoLogin.setToken(e.data['access_token']);
				return res.send(`
          <div>
            <h2>축하합니다!</h2>
            <p>카카오 로그인 성공하였습니다 :)</p>
            <a href="/account/kakaoLogin">메인으로</a>
          </div>
        `);
			})
			.catch((err) => {
				console.log(err);
				return res.send('error');
			});
	}

	@Get('kakaoEmail')
	kakaoEmail(@Res() res): void {
		// console.log(this.kakaoLogin)//아직 이메일 정보없음
		this.kakaoLogin
			.getEmail() //getemail을 통해서 email정보가 넘어옴
			.then((e) => {
				// console.log(e);
				console.log(e.data['properties']['nickname']);
				console.log(e.data['kakao_account']['email']);
				this.kakaoLogin.setEmail(e.data['kakao_account']['email']);
				this.kakaoLogin.setNickName(e.data['properties']['nickname']);

				return res.send(`
          <div>
            <h2>내 정보받기</h2>
          
            <a href="/account/kakaoLogin">메인으로</a>
          </div>
        // `);
			});
	}
	//카카오계정 저장
	@Post('/kakaoAuth')
	KakaoAuthCheck(@Body() kakaoChkEmaildto: KakaoChkEmailDto) {
		return this.kakaoLogin.kakaoCheck(kakaoChkEmaildto);
	}

	// 카카오 로그인 -> 고급에서 로그아웃 Logout Redirect URI 설정 필요
	@Get('kakaoLogout')
	kakaoLogout(@Res() res): void {
		// console.log(`LOGOUT TOKEN : ${this.kakaoLogin.accessToken}`);
		// // 로그아웃 -(1) 연결 끊기
		this.kakaoLogin
			.deleteLog()
			.then((e) => {
				console.log('로그아웃성공');
				return res.send(`
          <div>
            <h2>로그아웃 완료(연결끊기)</h2>
            <a href="/account/kakaoLogin">메인 화면으로</a>
          </div>
        `);
			})
			.catch((e) => {
				console.log(e);
				return res.send('DELETE ERROR');
			});
		// // 로그아웃 -(2) 토큰 만료
		// this.kakaoLogin
		//   .logout()
		//   .then((e) => {
		//     return res.send(`
		//       <div>
		//         <h2>로그아웃 완료(토큰만료)</h2>
		//         <a href="/kakaoLogin">메인 화면으로</a>
		//       </div>
		//     `);
		//   })
		//   .catch((e) => {
		//     console.log(e);
		//     return res.send('LogOUT ERROR');
		//   });
	}
}
