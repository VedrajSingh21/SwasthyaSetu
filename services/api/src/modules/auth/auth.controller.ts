import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './guards/auth.guard.js';
import { CurrentUser, Public } from './decorators/roles.decorator.js';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { UserRole } from './auth.types.js';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  role?: UserRole;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class StaffLoginDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  role?: UserRole;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-otp')
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.phone, body.role);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.phone, body.otp);
  }

  @Public()
  @Post('staff-login')
  async staffLogin(@Body() body: StaffLoginDto) {
    return this.authService.staffLogin(body.email, body.facilityId, body.role);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return {
      authenticated: true,
      user,
    };
  }
}
