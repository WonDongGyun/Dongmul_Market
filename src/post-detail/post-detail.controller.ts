import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/account/current-account.decorator';
import { AccountGuardJwt } from 'src/guard/account.guard.jwt';
import { PostDetailService } from './post-detail.service';

// **************************************
// * controller: post-detail
// * programer: DongGyun Won
// **************************************
@Controller('postDetail')
export class PostDetailController {
	constructor(private readonly postDetailService: PostDetailService) {}

	// 경매 글 상세내용
	@Get(':itemId')
	async getPostDetail(@Param('itemId') itemId: string) {
		return await this.postDetailService.getPostDetail(itemId);
	}

	// 로그인한 사용자의 경매 글 상세내용 채팅방 버튼 여부
	// 채팅방에 입장안한 상태라면, 채팅방 입장 버튼은 무조건 있어야함. 1:1은 꺼져있어야 함.
	@Get('/icrId/:icrId')
	@UseGuards(AccountGuardJwt)
	async getButton(
		@CurrentUser() email: string,
		@Param('icrId') icrId: string
	) {
		return await this.postDetailService.getButton(email, icrId);
	}
}
