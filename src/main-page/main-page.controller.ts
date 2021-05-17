import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/account/current-account.decorator';
import { AccountGuardJwt } from 'src/guard/account.guard.jwt';
import { DeleteButtonDto } from './dto/deleteButton.dto';
import { SetItemDto } from './dto/setItem.dto';
import { MainPageService } from './main-page.service';

@Controller('mainPage')
export class MainPageController {
	constructor(private readonly mainPageService: MainPageService) {}

	// 메인 화면
	// 사용자의 주소와 같은 주소를 가진 사람들의 경매 진행 중 목록만 가져옴
	@Get()
	@UseGuards(AccountGuardJwt)
	async getPostList(@CurrentUser() email: string) {
		return await this.mainPageService.getPostList(email);
	}

	// 로그인 하지 않은 사람들을 위한 메인 화면
	// 사용자의 주소와 같은 주소를 가진 사람들의 경매 진행 중 목록만 가져옴
	@Get('noLogin')
	async noLoginGetPost() {
		return await this.mainPageService.noLoginGetPost();
	}

	// 등록한 품목 삭제하기
	@Delete('delete')
	@UseGuards(AccountGuardJwt)
	async delButton(
		@CurrentUser() email: string,
		@Body() deleteButtonDto: DeleteButtonDto
	) {
		console.log(email);
		console.log(deleteButtonDto);
		return await this.mainPageService.deleteButton(email, deleteButtonDto);
	}

	// 경매 글 작성
	@Post()
	@UseGuards(AccountGuardJwt)
	@UseInterceptors(FileInterceptor('file'))
	async writePost(
		@Body() setItemDto: SetItemDto,
		@UploadedFile() file,
		@CurrentUser() email: string
	) {
		console.log(setItemDto);
		const a = new Date(setItemDto.deadLine);
		console.log(a);
		return await this.mainPageService.writePost(setItemDto, file, email);
	}

	// 경매 글 상세내용
	@Get(':itemId')
	async getPostDetail(@Param('itemId') itemId: string) {
		console.log(itemId);
		return await this.mainPageService.getPostDetail(itemId);
	}

	// 로그인한 사용자의 경매 글 상세내용 채팅방 버튼 여부
	// 채팅방에 입장안한 상태라면, 채팅방 입장 버튼은 무조건 있어야함. 1:1은 꺼져있어야 함.
	@Post(':icrId')
	@UseGuards(AccountGuardJwt)
	async getButton(
		@CurrentUser() email: string,
		@Param('icrId') icrId: string
	) {
		return await this.mainPageService.getButton(email, icrId);
	}
}
