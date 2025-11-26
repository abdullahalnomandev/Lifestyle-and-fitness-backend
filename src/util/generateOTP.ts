import { randomInt } from 'crypto';

const generateOTP = () => {
  return randomInt(10000, 100000);
};

export default generateOTP;
