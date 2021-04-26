import { PrismaClient } from '@prisma/client';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import cors from 'cors';
import 'dotenv-safe/config';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { CommentResolver } from './resolvers/comment';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
//
const prisma = new PrismaClient({
  log: ['query'],
  errorFormat: 'pretty',
});
const main = async () => {
  const app = express();
  // app.set('trust proxy', 1);
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 3600 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__,
        sameSite: 'lax',
      },
      saveUninitialized: false,
      secret: process.env.SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver, CommentResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, prisma, redis }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(parseInt(process.env.PORT), () =>
    console.log(`🚀 Server Started on PORT ${process.env.PORT}`)
  );
};

main()
  .catch((err) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
