import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      return true;
    }

    try {
      request.user = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token, {
        secret: process.env.JWT_SECRET ?? 'dev-only-change-me',
      });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token.');
    }
  }

  private extractToken(request: AuthenticatedRequest): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');

    return type === 'Bearer' && token ? token : null;
  }
}
