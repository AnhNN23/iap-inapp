import * as fs from 'fs';
import * as path from 'path';

export class FileLogger {
  private static readonly logFile = path.join(process.cwd(), 'apple-assn.log');

  static log(title: string, data: any) {
    const content = `[${new Date().toISOString()}] ${title}:\n${JSON.stringify(
      data,
      null,
      2,
    )}\n\n`;
    fs.appendFileSync(this.logFile, content, 'utf8');
  }
}
