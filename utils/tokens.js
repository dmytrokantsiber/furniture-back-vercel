const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "60d",
  });
  return {
    accessToken,
    refreshToken,
  };
};

const validateAccessToken = (token) => {
  try {
    const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return userData;
  } catch (e) {
    return null;
  }
};

const validateRefreshToken = (token) => {
  try {
    const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return userData;
  } catch (e) {
    return null;
  }
};

const findToken = async (refreshToken) => {
  const tokenData = await userModel.findOne({ refreshToken: refreshToken });
  return tokenData;
};

module.exports = {
  generateTokens,
  validateAccessToken,
  validateRefreshToken,
  findToken,
};
