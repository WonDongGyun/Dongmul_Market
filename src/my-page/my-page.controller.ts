import { Controller } from '@nestjs/common';
import { MyPageService } from './my-page.service';

@Controller('myPage')
export class MyPageController {
	constructor(private readonly myPageService: MyPageService) {}
}
