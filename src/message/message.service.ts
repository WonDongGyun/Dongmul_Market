import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
	signUpOk() {
		return { msg: 'success', successMsg: '회원가입 성공!' };
	}

	setUserErr() {
		return { msg: 'fail', errorMsg: '회원가입 실패' };
	}

	loginFail() {
		return {
			msg: 'fail',
			errorMsg: '잘못된 이메일 혹은 비밀번호를 입력하셨습니다.'
		};
	}

	socialLoginFail() {
		return {
			msg: 'fail',
			errorMsg: '로그인 실패'
		};
	}

	existEmail() {
		return {
			msg: 'fail',
			errorMsg:
				'해당 이메일이 이미 등록되어 있습니다. 로그인 방식을 확인해주세요.'
		};
	}

	sendEmailOk() {
		return {
			msg: 'success',
			successMsg: '인증번호 전송 완료'
		};
	}

	sendEmailReOk() {
		return {
			msg: 'success',
			successMsg: '인증번호 재 전송 완료'
		};
	}

	authNumOk() {
		return {
			msg: 'success',
			successMsg: '인증 성공!'
		};
	}

	authNumDiffent() {
		return {
			msg: 'fail',
			errorMsg: '인증번호가 틀립니다.'
		};
	}

	emailChkOk() {
		return {
			msg: 'fail',
			errorMsg: '이메일이 맞는지 확인 해주세요.!'
		};
	}

	passwordChangeOk() {
		return {
			msg: 'success',
			successMsg: '비밀번호 변경 성공!'
		};
	}
}
