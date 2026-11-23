import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private supabaseAdmin: SupabaseClient | null = null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Accepts the modern SUPABASE_SECRET_KEY, or fallback to SUPABASE_SERVICE_ROLE_KEY
    const supabaseSecretKey =
      this.configService.get<string>('SUPABASE_SECRET_KEY') ||
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (
      supabaseUrl &&
      supabaseSecretKey &&
      !supabaseUrl.includes('your-project') &&
      !supabaseSecretKey.includes('your-secret')
    ) {
      try {
        this.supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        this.logger.log('Supabase Secret Key client initialized for token authentication');
      } catch (err) {
        this.logger.warn(`Could not initialize Supabase client: ${err.message}`);
      }
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    let userId: string | null = null;
    let email: string | null = null;
    let userMetadata: any = null;

    // 1. Modern Supabase Auth Token verification using SUPABASE_SECRET_KEY (getUser)
    if (this.supabaseAdmin) {
      try {
        const { data, error } = await this.supabaseAdmin.auth.getUser(token);
        if (!error && data?.user) {
          userId = data.user.id;
          email = data.user.email || null;
          userMetadata = data.user.user_metadata || {};
        }
      } catch (supabaseErr) {
        // Log & proceed to local fallback verification
      }
    }

    // 2. Fallback to internal JWT verification (for local development, demo switcher, and tests)
    if (!userId) {
      try {
        const secret =
          this.configService.get<string>('JWT_SECRET') ||
          'vidyaflow_production_grade_jwt_secret_key_super_secure_2026';

        const payload = this.jwtService.verify(token, { secret });
        userId = payload.sub || payload.id;
        email = payload.email || null;
        userMetadata = payload.user_metadata || {};
      } catch (jwtErr) {
        throw new UnauthorizedException('Session expired or invalid token');
      }
    }

    if (!userId) {
      throw new UnauthorizedException('Invalid token payload: missing user ID');
    }

    // 3. Retrieve or auto-provision user in PostgreSQL database
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      if (email) {
        user = await this.prisma.user.create({
          data: {
            id: userId,
            email: email.toLowerCase(),
            name: userMetadata?.name || email.split('@')[0],
            role: (userMetadata?.role as any) || 'STUDENT',
          },
        });
      } else {
        throw new UnauthorizedException('User account not found in database');
      }
    }

    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return true;
  }
}
