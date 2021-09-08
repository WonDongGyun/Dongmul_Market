import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ForgotPasswordDto{
    @IsNotEmpty()
    @ApiProperty()
    email: string

    // @IsNumber()
    // newpassword: number
}