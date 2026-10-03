/**
 * One-shot operator bootstrap (super-admin upsert).
 * Never wire into CD. Credentials come from env / Compose run only.
 */
import { fromEnv } from '../env';

export const bootstrapConfig = {
  /**
   * Production gate — must be exactly `yes` when NODE_ENV=production.
   * Leave unset in `.env` permanently; pass only on the one-shot command line.
   */
  confirmProdBootstrapAdmin:
    fromEnv.get('CONFIRM_PROD_BOOTSTRAP_ADMIN').default('').asString() === 'yes',

  adminEmail: fromEnv
    .get('BOOTSTRAP_ADMIN_EMAIL')
    .default('contact@barthez-kenwou.dev')
    .asString()
    .trim()
    .toLowerCase(),
  adminPassword: fromEnv.get('BOOTSTRAP_ADMIN_PASSWORD').default('admin123').asString(),
  adminFirstName: fromEnv.get('BOOTSTRAP_ADMIN_FIRST_NAME').default('Barthez').asString().trim(),
  adminLastName: fromEnv.get('BOOTSTRAP_ADMIN_LAST_NAME').default('Kenwou').asString().trim(),
  adminPhone: fromEnv.get('BOOTSTRAP_ADMIN_PHONE').default('+237 655 646 688').asString().trim(),
  adminAvatarUrl: fromEnv
    .get('BOOTSTRAP_ADMIN_AVATAR_URL')
    .default(
      'https://jebiwuygwtpmdnhhzsbw.supabase.co/storage/v1/object/public/Portfolio-Barthez/Profile/barthez-type-2.jpeg',
    )
    .asString()
    .trim(),
} as const;

export type BootstrapConfig = typeof bootstrapConfig;
