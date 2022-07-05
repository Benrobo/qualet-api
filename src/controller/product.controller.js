import prismaDB from "../config/prisma";
import { genHash, compareHash } from "../helpers";
import customRequestError from "../helpers/response";
import sendResponse from "../helpers/response";
import { validateEmail } from "../utils/validate";
import { genAccessToken, genRefreshToken } from "../helpers/token";
import { genId } from "../helpers";
import { prisma } from "@prisma/client";

export default class ProductsController {
  async create(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to add product, missing payload."
      );
    }

    const { name, category, description, currency, price, image, userId } =
      payload;

    if (userId === "" || userId === undefined) {
      return sendResponse(res, 400, false, "product userId is missing");
    }
    if (name === "" || name === undefined) {
      return sendResponse(res, 400, false, "product name is missing");
    }
    if (description === "" || description === undefined) {
      return sendResponse(res, 400, false, "product description is missing");
    }
    if (image === "" || image === undefined) {
      return sendResponse(res, 400, false, "product image is missing");
    }
    if (currency === "" || currency === undefined) {
      return sendResponse(res, 400, false, "product currency is missing");
    }
    if (category === "" || category === undefined) {
      return sendResponse(res, 400, false, "product category is missing");
    }

    // check if user with that id exists

    const doesUserExists = await prismaDB.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (doesUserExists === null)
      return sendResponse(
        res,
        404,
        false,
        "failed to add product. is either this user doesnt exists or you are logged out."
      );

    try {

      const saveedProduct = await prismaDB.products.create({
        data: {
          id: `product_${genId().split("-").slice(0, 1).join("")}`,
          orgId: doesUserExists?.orgId,
          authorId: userId,
          title: name,
          description,
          image,
          currency,
          price,
          categories: category,
        },
      });

      return sendResponse(
        res,
        201,
        true,
        "product added succesffully",
        saveedProduct
      );
    } catch (e) {
      return sendResponse(res, 500, false, "failed ading product.", {
        error: e.message,
      });
    }
  }

  async getById(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to fetch product, missing payload."
      );
    }

    const { productId } = payload;

    if (productId === "" || productId === undefined) {
      return sendResponse(res, 400, false, "product ID is missing");
    }
    // check if product exists with that id
    const doesProductExists = await prismaDB.products.findMany({
      where: { id: productId },
    });

    if (doesProductExists.length === 0) {
      return sendResponse(res, 404, false, "no product avaliable with that id");
    }

    try {
      const productById = await prismaDB.products.findMany({
        where: {
          id: productId,
        },
      });

      return sendResponse(
        res,
        201,
        true,
        "product fetched succesffully",
        productById
      );
    } catch (e) {
      return sendResponse(res, 500, false, "failed fetching product.", {
        error: e.message,
      });
    }
  }

  async getByOrgId(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to fetch product, missing payload."
      );
    }

    const { orgId } = payload;

    if (orgId === "" || orgId === undefined) {
      return sendResponse(
        res,
        400,
        false,
        "product organization ID is missing"
      );
    }
    // check if product exists with that id
    const doesOrgExists = await prismaDB.user.findMany({
      where: { orgId },
    });

    if (doesOrgExists.length === 0) {
      return sendResponse(res, 404, false, "failed fetching products: organization was not found");
    }

    try {
      const orgInfo = await prismaDB.user.findUnique({
        where: {
          orgId
        }
      })

      const productByOrgId = await prismaDB.products.findMany({
        where: {
          orgId: orgId,
        }
      });

      const compiledData = {
        products: productByOrgId,
        organization: {
          id: orgInfo?.id,
          orgId: orgInfo?.orgId,
          username: orgInfo?.username,
          email: orgInfo?.email,
          phonenumber: orgInfo?.phonenumber,
        }
      }

      return sendResponse(
        res,
        201,
        true,
        "products fetched succesffully",
        compiledData
      );
    } catch (e) {
      return sendResponse(res, 500, false, "failed fetching product.", {
        error: e.message,
      });
    }
  }

  async updateProduct(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to add product, missing payload."
      );
    }

    const { name, category, description, currency, price, image, userId, productId } =
      payload;

    if (userId === "" || userId === undefined) {
      return sendResponse(res, 400, false, "product userId is missing");
    }
    if (name === "" || name === undefined) {
      return sendResponse(res, 400, false, "product name is missing");
    }
    if (description === "" || description === undefined) {
      return sendResponse(res, 400, false, "product description is missing");
    }
    if (image === "" || image === undefined) {
      return sendResponse(res, 400, false, "product image is missing");
    }
    if (currency === "" || currency === undefined) {
      return sendResponse(res, 400, false, "product currency is missing");
    }
    if (category === "" || category === undefined) {
      return sendResponse(res, 400, false, "product category is missing");
    }
    if (productId === "" || productId === undefined) {
      return sendResponse(res, 400, false, "product productId is missing");
    }

    // check if 
    // 1. user with that id exists
    // 2. product exists
    // 2. user updating has permission to update product

    // PRODUCT EXISTS
    const doesProductExists = await prismaDB.products.findMany({
      where: {
        id: productId,
      },
    });

    if (doesProductExists.length === 0)
      return sendResponse(
        res,
        404,
        false,
        "failed to update product. product was not found."
      );

    // USER EXISTS

    const doesUserExists = await prismaDB.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (doesUserExists === null)
      return sendResponse(
        res,
        404,
        false,
        "failed to update product. is either this user doesnt exists or you are logged out."
      );

    // PERMISSION
    const productUpdatePermission = doesProductExists.filter(data => data.authorId === userId)

    if (productUpdatePermission.length === 0)
      return sendResponse(
        res,
        403,
        false,
        "Not authorised to update product."
      );

    try {

      const updateProduct = await prismaDB.products.update({
        where: {
          id: productId
        },
        data: {
          title: name,
          description,
          image,
          currency,
          price,
          categories: category,
        },
      });

      return sendResponse(
        res,
        201,
        true,
        "product updated succesffully",
        updateProduct
      );
    } catch (e) {
      return sendResponse(res, 500, false, "failed updating product.", {
        error: e.message,
      });
    }
  }

  async deleteProduct(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed deleting product, missing payload."
      );
    }

    const { userId, productId } = payload;

    if (userId === "" || userId === undefined) {
      return sendResponse(res, 400, false, "product userId is missing");
    }
    if (productId === "" || productId === undefined) {
      return sendResponse(res, 400, false, "product productId is missing");
    }

    // check if 
    // 1. user with that id exists
    // 2. product exists
    // 2. user updating has permission to update product

    // PRODUCT EXISTS
    const doesProductExists = await prismaDB.products.findMany({
      where: {
        id: productId,
      },
    });

    if (doesProductExists.length === 0)
      return sendResponse(
        res,
        404,
        false,
        "failed to delete product. product was not found."
      );

    // USER EXISTS

    const doesUserExists = await prismaDB.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (doesUserExists === null)
      return sendResponse(
        res,
        404,
        false,
        "failed to delete product. is either this user doesnt exists or you are logged out."
      );

    // PERMISSION
    const productUpdatePermission = doesProductExists.filter(data => data.authorId === userId)

    if (productUpdatePermission.length === 0)
      return sendResponse(
        res,
        403,
        false,
        "Not authorised to delete product."
      );

    try {

      const updateProduct = await prismaDB.products.delete({
        where: {
          id: productId
        }
      });

      return sendResponse(
        res,
        201,
        true,
        "product deleted succesffully",
        updateProduct
      );
    } catch (e) {
      return sendResponse(res, 500, false, "failed deleting product.", {
        error: e.message,
      });
    }
  }
}
