declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    SECRET: string;
    CORS_ORIGIN: string;
  }
}