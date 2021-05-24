import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
	// **************************************
	// * service: -
	// * programer: DongGyun Won
	// **************************************
	insertQueryErr() {
		return { msg: 'success', errorMsg: 'insert query fail' };
	}

	updateQueryErr() {
		return { msg: 'success', errorMsg: 'update query fail' };
	}

	deleteQueryErr() {
		return { msg: 'success', errorMsg: 'delete query fail' };
	}

	findQueryErr() {
		return { msg: 'success', errorMsg: 'find query fail' };
	}

	selectQueryErr() {
		return { msg: 'success', errorMsg: 'select query fail' };
	}

	returnSuccess() {
		return { msg: 'success' };
	}

	returnFail() {
		return { msg: 'fail' };
	}

	// **************************************
	// * service: account
	// * programer: JaeYoon Lee
	// **************************************
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

<<<<<<< HEAD
	passwordChangeNO() {
		return {
			msg: 'success',
			successMsg: '비밀번호 변경 실패!'
		}
=======
	// **************************************
	// * service: main-page
	// * programer: DongGyun Won
	// **************************************
	deleteButtonErr() {
		return {
			msg: 'fail',
			errorMsg: 'itemId가 다릅니다.'
		};
	}

	getPostListErr() {
		return {
			msg: 'fail',
			errorMsg: '잘못된 이메일입니다. 이메일을 확인해주세요.'
		};
	}

	// **************************************
	// * service: my-page
	// * programer: DongGyun Won, JaeYoon Lee
	// **************************************
	addressChangeOk() {
		return { msg: 'success', message: '주소 변경 완료' };
	}

	addressChangeErr() {
		return {
			msg: 'fail',
			errorMsg: '주소를 입력해주세요'
		};
	}

	getMyPostErr() {
		return {
			msg: 'fail',
			errorMsg: '잘못된 이메일입니다. 이메일을 확인해주세요.'
		};
	}

	// **************************************
	// * service: post-detail
	// * programer: DongGyun Won
	// **************************************
	getPostDetailErr() {
		return {
			msg: 'fail',
			errorMsg: 'itemId를 다시 확인해주세요.'
		};
	}

	// **************************************
	// * service: chat
	// * programer: DongGyun Won
	// **************************************
	handleAuthenticateErr() {
		return { msg: 'fail', errorMsg: 'Unauthorization' };
	}

	handleConnectionErr() {
		return {
			msg: 'fail',
			errorMsg: '이메일 혹은 채팅방id를 확인해주세요.'
		};
	}

	showChatUserErr() {
		return {
			msg: 'fail',
			errorMsg: '현재 존재하지 않는 채팅방입니다. 다시 시도해 주십시오.'
		};
	}

	chatRoomMsgErr() {
		return {
			msg: 'fail',
			errorMsg:
				'현재 존재하지 않는 채팅방이거나 사용자 이메일이 잘못되었습니다.'
		};
>>>>>>> 5be1d63ef9ae40de40c5487a880cea6f187dba4c
	}
}

