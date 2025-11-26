import { randomInt } from 'crypto';

const generateOTP = () => {
  return randomInt(1000, 10000);
};

export default generateOTP;
