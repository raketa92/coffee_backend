import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { EnvService } from "@infrastructure/env";

interface JwtPayload {
  sub: string;
  phone: string;
}

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);
    console.log(`✅ ~ token:`, token);

    if (!token) {
      throw new WsException("UNAUTHORIZED");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.envService.get("JWT_SECRET"),
        audience: "access",
      });
      (client as Socket & { user?: { id: string } }).user = { id: payload.sub };
      return true;
    } catch {
      throw new WsException("UNAUTHORIZED");
    }
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === "string" && authToken.trim()) {
      return authToken.trim();
    }

    const header = client.handshake.headers?.authorization;
    if (typeof header === "string" && header.trim()) {
      const lower = header.toLowerCase();
      if (lower.startsWith("bearer ")) {
        return header.slice(7).trim();
      }
      return header.trim();
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === "string" && queryToken.trim()) {
      return queryToken.trim();
    }
    if (Array.isArray(queryToken) && queryToken[0]) {
      return String(queryToken[0]).trim();
    }

    return null;
  }
}
