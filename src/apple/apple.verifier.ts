import {
  SignedDataVerifier,
  Environment,
} from '@apple/app-store-server-library';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppleConfig } from '../config/apple.config';
import { FileLogger } from 'src/utils/logger';

export class AppleVerifier {
  private static instance: SignedDataVerifier;

  static getVerifier() {
    if (!this.instance) {
      const appleRootCAs = [readFileSync(join(__dirname, '../../keys/AuthKey_KW88U2V8AD.p8'))]; 
      const enableOnlineChecks = true;
      const appAppleId = undefined; 

      this.instance = new SignedDataVerifier(
        appleRootCAs,
        enableOnlineChecks,
        AppleConfig.environment,
        AppleConfig.bundleId,
        appAppleId,
      );
    }
    return this.instance;
  }

  static async verifyNotification(payload: string) {
    try {
      const verifier = this.getVerifier();
      const verified = await verifier.verifyAndDecodeNotification(payload);
      FileLogger.log('Verified Notification', verified);
      return verified;
    } catch (error) {
      FileLogger.log('Verification Failed', error);
      throw error;
    }
  }
}
