const UserModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const {
  generateTokens,
  validateRefreshToken,
  findToken,
} = require("../utils/tokens");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exceptions/api-error");

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password, name, surname, phone } = req.body;
      const existingEmailUser = await UserModel.findOne({ email });

      if (existingEmailUser) {
        return res.status(400).json({
          ua: "Користувач з таким email уже існує!",
          en: "User with this email already exists",
        });
      }

      const hashPassword = await bcrypt.hash(password, 3);
      const newUser = await UserModel.create({
        email,
        password: hashPassword,
        name,
        surname,
        phone,
      });
      const userDto = new UserDto(newUser);
      return res.json({ user: { ...userDto } });
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          ua: "Введено невірні дані",
          en: "Wrong login values",
        });
      }
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        return res.status(400).json({
          ua: "Введено невірні дані",
          en: "Wrong login values",
        });
      }
      const tokens = generateTokens({
        email: user.email,
        name: user.name,
        surname: user.surname,
      });
      if (user && tokens) {
        user.refreshToken = tokens.refreshToken;
      }
      await user.save();
      const userDto = new UserDto(user);
      res.cookie("refreshToken", user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
        domain: "furniture-back-five.vercel.app",
        sameSite: "none",
      });
      return res.json({
        user: { ...userDto },
        accessToken: tokens.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { email } = req.body.user;
      const userData = await UserModel.findOne({ email });
      userData.refreshToken = "";
      userData.accessToken = "";
      await userData.save();
      res.clearCookie("refreshToken", {
        sameSite: "none",
        secure: true,
        domain: ".furniture-back-five.vercel.app",
      });
      const userDto = new UserDto(userData);
      return res.json(userDto);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw ApiError.UnauthorizedError();
      }
      const userData = validateRefreshToken(refreshToken);
      const existingToken = await findToken(refreshToken);

      if (!userData || !existingToken) {
        res.clearCookie("refreshToken", {
          sameSite: "none",
          secure: true,
          domain: ".furniture-back-five.vercel.app",
        });
        throw ApiError.UnauthorizedError();
      }
      const user = await UserModel.findOne({ email: userData.email });

      const tokens = generateTokens({
        email: user.email,
        name: user.name,
        surname: user.surname,
      });
      if (user && tokens) {
        user.refreshToken = tokens.refreshToken;
      }
      await user.save();
      const userDto = new UserDto(user);
      res.cookie("refreshToken", user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
        domain: "furniture-back-five.vercel.app",
        sameSite: "none",
      });
      return res.json({
        user: { ...userDto },
        accessToken: tokens.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateUserInfo(req, res, next) {
    try {
      const { user: oldUserInfo } = req;
      const { name: newName, surname: newSurname } = req.body;

      const user = await UserModel.findOne({ email: oldUserInfo.email });

      if (user) {
        user.name = newName;
        user.surname = newSurname;
        await user.save();
        res.json({ user });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await UserModel.find();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
