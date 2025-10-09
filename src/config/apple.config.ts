import { readFileSync } from 'fs';
import { join } from 'path';
import { Environment } from '@apple/app-store-server-library';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppleConfig = {
  issuerId: process.env.APPLE_ISSUER_ID!,
  keyId: process.env.APPLE_KEY_ID!,
  bundleId: process.env.APPLE_BUNDLE_ID!,
  privateKey: readFileSync(join(process.cwd(), process.env.APPLE_KEY_PATH!), 'utf8'),
  environment:
    process.env.APPLE_ENVIRONMENT === 'production'
      ? Environment.PRODUCTION
      : Environment.SANDBOX,
};
