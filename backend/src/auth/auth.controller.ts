import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, DemoLoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Rate limited: 10 registrations per minute per IP to prevent spam attacks
   */
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Rate limited: 20 login attempts per minute per IP to prevent brute-force attacks
   */
  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * One-click demo login endpoint for rapid assessment & testing
   */
  @Post('demo-login')
  @HttpCode(HttpStatus.OK)
  async demoLogin(@Body() demoDto: DemoLoginDto) {
    return this.authService.demoLogin(demoDto);
  }

  /**
   * Get currently authenticated user's profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id);
  }
}
