import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  discord: {
    token: required('DISCORD_TOKEN'),
    clientId: required('DISCORD_CLIENT_ID'),
    guildId: process.env.GUILD_ID ?? '',
    opsRoleId: process.env.OPS_ROLE_ID ?? '',
    financeRoleId: process.env.FINANCE_ROLE_ID ?? '',
  },
  db: {
    url: required('DATABASE_URL'),
  },
  isDev: process.env.NODE_ENV !== 'production',
};
