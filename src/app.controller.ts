import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

@Controller('notifications')
export class NotificationsController {
  private readonly logFile = path.join(__dirname, '../../assn-log.txt');

  constructor() {
    // Tạo file log nếu chưa có
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '', 'utf8');
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleNotifications(@Req() req: Request, @Res() res: Response) {
    try {
      const { signedPayload } = req.body;

      if (!signedPayload) {
        throw new Error('Missing signedPayload');
      }

      // 1️⃣ Decode header của JWT
      const [headerB64] = signedPayload.split('.');
      const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
      const kid = header.kid;

      // 2️⃣ Lấy danh sách public keys của Apple
      const appleKeysRes = await axios.get(
        'https://api.storekit.itunes.apple.com/inApps/v1/notifications/keys'
      );
      const appleKeys = appleKeysRes.data.keys;

      const key = appleKeys.find((k) => k.keyId === kid);
      if (!key) throw new Error('Apple public key not found');

      // 3️⃣ Chuyển sang PEM format để verify
      const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.publicKey}\n-----END PUBLIC KEY-----`;

      // 4️⃣ Verify chữ ký
      const decoded = jwt.verify(signedPayload, publicKey, { algorithms: ['ES256'] });

      // 5️⃣ Ghi log thông báo
      const logData =
        `[${new Date().toISOString()}] Verified ASSN V2 Notification:\n` +
        JSON.stringify(decoded, null, 2) +
        '\n\n';
      fs.appendFileSync(this.logFile, logData, 'utf8');

      console.log('✅ Verified notification:', decoded);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('❌ Verification failed:', error.message);

      const logData =
        `[${new Date().toISOString()}] Verification failed: ${error.message}\n\n`;
      fs.appendFileSync(this.logFile, logData, 'utf8');

      // Apple sẽ retry nếu không trả 200
      res.status(400).json({ error: 'Invalid ASSN notification' });
    }
  }
}
