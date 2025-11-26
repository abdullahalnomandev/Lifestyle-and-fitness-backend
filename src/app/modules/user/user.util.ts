import axios from "axios";

export const getUserInfoWithToken = async (token: string) => {
  return await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAppleUserInfoWithToken = async (token: string) => {
  return await axios.get('https://appleid.apple.com/auth/userinfo', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

