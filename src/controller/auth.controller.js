import prismaDB from "../config/prisma";
import { genHash, compareHash } from "../helpers/";
import customRequestError from "../helpers/response";
import sendResponse from "../helpers/response";
import { validateEmail } from "../utils/validate";
import { genAccessToken, genRefreshToken } from "../helpers/token";
import { genId, genOrgId } from "../helpers";

export default class AuthControler {
  async login(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to log In, missing payload."
      );
    }

    const { email, password } = payload;

    if (email === "") {
      return sendResponse(res, 400, false, "email is missing");
    }

    if (password === "") {
      return sendResponse(res, 400, false, "password is missing");
    }

    if (!validateEmail(email))
      return sendResponse(res, 400, false, "email given is invalid");

    // check if user with this email address already exists

    const userExistsResult = await prismaDB.user.findUnique({
      where: {
        email,
      },
    });

    if (userExistsResult === null)
      return sendResponse(
        res,
        404,
        false,
        "user with this email address doesnt exists"
      );

    // check if password is correct
    const userData = await prismaDB.user.findUnique({
      where: {
        email,
      },
    });

    if (!compareHash(password, userData?.hash))
      return sendResponse(res, 400, false, "password given is incorrect");

    try {
      const userPayload = {
        id: userData?.id,
        orgId: userData?.orgId,
        username: userData?.username,
        email: userData?.email,
      };
      const refreshToken = genRefreshToken(userPayload);
      const accessToken = genAccessToken(userPayload);

      await prismaDB.user.update({
        where: {
          email,
        },
        data: {
          refreshToken,
        },
      });

      return sendResponse(res, 201, true, "Logged In successfull", {
        ...userPayload,
        accessToken,
      });
    } catch (e) {
      sendResponse(res, 500, false, "something went wrong logging in", {
        error: e.message,
      });
    }
  }

  async register(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to register In, missing payload."
      );
    }

    const { username, email, password, phonenumber } = payload;

    // return console.log(payload);
    if (email === "") {
      return sendResponse(res, 400, false, "email is missing");
    }

    if (username === "") {
      return sendResponse(res, 400, false, "username is missing");
    }

    if (password === "") {
      return sendResponse(res, 400, false, "password is missing");
    }
    if (phonenumber === "" || phonenumber === undefined) {
      return sendResponse(res, 400, false, "phonenumber is missing");
    }

    if (!validateEmail(email))
      return sendResponse(res, 400, false, "email given is invalid");

    // check if user with this email address already exists
    const userMailExists = await prismaDB.user.findUnique({
      where: {
        email,
      },
    });

    // check if phonenumber already exists
    const userPhonenumberExists = await prismaDB.user.findUnique({
      where: {
        phonenumber,
      },
    });

    if (userMailExists !== null)
      return sendResponse(
        res,
        400,
        false,
        "organization with that email already exists"
      );

    if (userPhonenumberExists !== null)
      return sendResponse(
        res,
        400,
        false,
        "organization with that phonenumber already exists"
      );

    try {
      // save data
      const savedData = await prismaDB.user.create({
        data: {
          id: genId(),
          orgId: `org_${genOrgId(6)}`,
          phonenumber,
          username,
          email,
          refreshToken: "",
          hash: genHash(password),
        },
      });

      return sendResponse(
        res,
        201,
        true,
        "organization registered successfully",
        savedData
      );
    } catch (e) {
      sendResponse(
        res,
        500,
        false,
        "something went wrong registering organization",
        {
          error: e.message,
        }
      );
    }
  }
}
