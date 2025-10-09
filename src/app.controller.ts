import { Controller, Post, Get, Req, Res, HttpStatus, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('notifications')
export class NotificationsController {
  private readonly logFile = path.join(__dirname, '../../assn.log');

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleNotifications(@Req() req: any, @Res() res: any) {
    const now = new Date().toISOString();
    const reqBody = req.body;
    const reqHeaders = req.headers;

    try {
      const logRequest = `[${now}] Incoming Notification:\nHeaders: ${JSON.stringify(reqHeaders, null, 2)}\nBody: ${JSON.stringify(reqBody, null, 2)}\n`;
      fs.appendFileSync(this.logFile, logRequest, 'utf8');

      const response = { success: true, receivedAt: now };
      const logResponse = `[${now}] Response Sent:\n${JSON.stringify(response, null, 2)}\n\n`;
      fs.appendFileSync(this.logFile, logResponse, 'utf8');

      return res.status(200).json(response);
    } catch (error: any) {
      const logError = `[${now}] Error: ${error.message}\n\n`;
      fs.appendFileSync(this.logFile, logError, 'utf8');

      return res.status(200).json({ success: false, error: error.message });
    }
  }


  @Get('logs')
  async getLogs(@Res() res: any) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return res.status(404).json({ message: 'Log file not found' });
      }

      const content = fs.readFileSync(this.logFile, 'utf8');
      return res
        .status(200)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .send(content);
    } catch (error: any) {
      return res.status(500).json({ message: 'Failed to read log file', error: error.message });
    }
  }

  
  @Post('logs/clear')
  async clearLogs(@Res() res: any) {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, '', 'utf8');
      }
      return res.status(200).json({ message: 'Log file cleared successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Failed to clear log file', error: error.message });
    }
  }
}
