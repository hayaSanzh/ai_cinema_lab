import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type RequestWithAuthHeader = {
  headers: {
    authorization?: string;
  };
};

export type AuthenticatedRequest = RequestWithAuthHeader & {
  user?: {
    sub: string;
    email: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token.');
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

  private extractToken(request: RequestWithAuthHeader): string | null {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');

    return type === 'Bearer' && token ? token : null;
  }
}
