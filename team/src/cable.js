import { createConsumer } from '@rails/actioncable';

let cable = null;

export const getCable = (token) => {
  if (!cable) {
    cable = createConsumer(`ws://localhost:3000/cable?token=${token}`);
  }
  return cable;
};
