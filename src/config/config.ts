import * as fs from 'fs';

const readFile = (path: string | undefined) => {
  if (!path) return null;
  return fs.readFileSync(path);
};

const yn = (value, defaultValue) => {
  if (['true', '1', 1, true].includes(value)) return true;
  if (['false', '0', 0, false].includes(value)) return false;
  return defaultValue;
};

const Config = {
  grpc: {
    listen: process.env.HOST || '127.0.0.1:3000',
    credentials: {
      insecure: yn(process.env.TLS_INSECURE, true),
      caCert: readFile(process.env.TLS_CA_CERT_PATH || undefined),
      privateKey: readFile(process.env.TLS_KEY_PATH || undefined),
      certChain: readFile(process.env.TLS_CERT_PATH || undefined),
      verifyClient: yn(process.env.TLS_VERIFY_CLIENT_CERT, false),
    },
  },
  redis: {
    connection: {
      url: process.env.REDIS_HOST || 'redis://localhost:6379',
      username: process.env.REDIS_USER || '',
      password: process.env.REDIS_PASSWORD || '',
      database: process.env.REDIS_DATABASE || '0',
    },
    timeout: {
      connection: 10000,
    },
  },
};

export default Config;
