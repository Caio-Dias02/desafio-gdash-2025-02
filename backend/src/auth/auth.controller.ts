import { Controller, Post, Body, Res, UseGuards, Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { accessToken, user } = await this.authService.login(loginDto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });

    return res.json({ user });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    return res.json({ message: 'Logout realizado com sucesso' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Res() res: Response) {
    // JwtAuthGuard coloca user em req.user
    return res.json((res as any).req?.user || {});
  }
}
