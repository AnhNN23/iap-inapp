import { Injectable, Logger } from '@nestjs/common';
import { AppStoreServerAPIClient, Environment } from '@apple/app-store-server-library';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleService {
  private readonly client: AppStoreServerAPIClient;
  private readonly logger = new Logger(AppleService.name);

  constructor(private readonly configService: ConfigService) {
    const issuerId = this.configService.get<string>('APPLE_ISSUER_ID');
    const keyId = this.configService.get<string>('APPLE_KEY_ID');
    const bundleId = this.configService.get<string>('APPLE_BUNDLE_ID');
    const keyPathEnv = this.configService.get<string>('APPLE_KEY_PATH');
    const env = this.configService.get<string>('APPLE_ENV');

    if (!issuerId || !keyId || !bundleId || !keyPathEnv) {
      throw new Error(
        'Missing one or more required Apple environment variables: APPLE_ISSUER_ID, APPLE_KEY_ID, APPLE_BUNDLE_ID, APPLE_KEY_PATH',
      );
    }

    const keyFullPath = join(process.cwd(), keyPathEnv);
    this.logger.log(`Looking for Apple private key at: ${keyFullPath}`);

    if (!existsSync(keyFullPath)) {
      throw new Error(`Apple private key file not found: ${keyFullPath}`);
    }

    const encodedKey = readFileSync(keyFullPath, 'utf8');

    const environment =
      env?.toLowerCase() === 'production' ? Environment.PRODUCTION : Environment.SANDBOX;

    this.client = new AppStoreServerAPIClient(encodedKey, keyId, issuerId, bundleId, environment);
    this.logger.log('Apple AppStoreServerAPIClient initialized successfully.');
  }

  async sendTestNotification() {
    try {
      const response = await this.client.requestTestNotification();
      this.logger.log(`Test notification sent successfully: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error('Failed to send test notification', error as any);
      throw error;
    }
  }
}
