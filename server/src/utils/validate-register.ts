import { RegisterInputs } from './user-types';

function emailIsValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export const validateRegister = (options: RegisterInputs) => {
  if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'length must be greater than 2',
      },
    ];
  }
  if (!emailIsValid(options.email)) {
    return [
      {
        field: 'email',
        message: 'Email must be valid',
      },
    ];
  }
  if (options.password.length < 6) {
    return [
      {
        field: 'password',
        message: 'length must be greater than 5',
      },
    ];
  }
  return null;
};
