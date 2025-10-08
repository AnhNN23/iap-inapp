import { Controller, Post, Get, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('v2')
export class AppController {
  private readonly logDir = path.join(__dirname, '../../logs');
  private readonly logFile = path.join(this.logDir, 'appstore.log');

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '', 'utf8');
    }
  }

  @Post('notifications')
  @HttpCode(HttpStatus.OK)
  async handleNotifications(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;
      const logData = `[${new Date().toISOString()}] Notification:\n${JSON.stringify(body, null, 2)}\n\n`;
      fs.appendFileSync(this.logFile, logData, 'utf8');
      console.log('Received ASSN V2:', body?.notificationType || '(unknown)');
      return res.status(200).json({ message: 'OK' });
    } catch (error) {
      console.error('Error processing notification:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('logs')
  async getLogs(@Res() res: Response) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return res.status(404).json({ message: 'Log file not found' });
      }
      const content = fs.readFileSync(this.logFile, 'utf8');
      return res.status(200).send(`<pre>${content}</pre>`);
    } catch (error) {
      console.error('Error reading log file:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Get('logs/download')
  async downloadLogs(@Res() res: Response) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return res.status(404).json({ message: 'Log file not found' });
      }
      res.download(this.logFile);
    } catch (error) {
      console.error('Error downloading log file:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
