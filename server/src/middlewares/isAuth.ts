import { MyContext } from 'src/types';
import { MiddlewareFn } from 'type-graphql';

export const isAuth: MiddlewareFn<MyContext> = async (
  { context: { req } },
  next
) => {
  if (!req.session.userId) {
    throw new Error('Not Authenticated');
  }
  return next();
};
