import { Body, Controller, Post } from '@nestjs/common';
import { MyPageService } from './my-page.service';
import { AddressChange } from './dto/addressChange.dto';

@Controller('myPage')
export class MyPageController {
	constructor(private readonly myPageService: MyPageService) {}
//주소 변경
	@Post('address')
	async AddressChange(@Body() addressChangeDto: AddressChange) {
		return await this.myPageService.addressChange(addressChangeDto) 
	}
}
