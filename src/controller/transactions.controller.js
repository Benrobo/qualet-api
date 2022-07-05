import prismaDB from "../config/prisma";
import sendResponse from "../helpers/response";
import {
  validateCardExp,
  validateCardNumber,
  validateCvv,
  validateEmail,
} from "../utils/validate";
import { genId } from "../helpers";
import moment from "moment";

export default class TransactionController {
  #currDate = moment().format("MMMM Do YYYY, h:mm:ss a");

  #calcTotalAmount(purchasedProd = []) {
    let totalAmount = 0;

    if (purchasedProd.length === 0) return totalAmount;

    totalAmount = purchasedProd
      .map((prod) => [prod.price, prod.quantity])
      .reduce(
        (total, price) => (total += parseInt(price) * parseInt(price[1])),
        0
      );
    return totalAmount;
  }

  async #sendCustomerReceipt(email, username, phoneNumber, totalAmount, orgId) {

  }

  async #debitFCustomer() {

  }

  async create(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to create transaction, missing payload."
      );
    }

    const {
      orgId,
      username,
      email,
      cardNumber,
      cardCvv,
      cardExp,
      phonenumber,
      productsPayload,
    } = payload;

    if (username === "" || username === undefined) {
      return sendResponse(res, 400, false, "card username is missing");
    }
    if (phonenumber === "" || phonenumber === undefined) {
      return sendResponse(res, 400, false, "payment phonenumber is missing");
    }
    if (orgId === "" || orgId === undefined) {
      return sendResponse(res, 400, false, "payment orgId is missing");
    }
    if (email === "" || email === undefined) {
      return sendResponse(res, 400, false, "card email is missing");
    }
    if (cardNumber === "" || cardNumber === undefined) {
      return sendResponse(res, 400, false, "card number is missing");
    }
    if (cardExp === "" || cardExp === undefined) {
      return sendResponse(res, 400, false, "card expiry is missing");
    }
    if (cardCvv === "" || cardCvv === undefined) {
      return sendResponse(res, 400, false, "card cvv is missing");
    }

    if (productsPayload.length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "cart products details are missing."
      );
    }

    // validate card exp
    if (!validateCardExp(cardExp)) {
      return sendResponse(res, 400, false, "card expiry is invalid.");
    }

    // Cvv validation
    if (!validateCvv(cardCvv)) {
      return sendResponse(res, 400, false, "card Cvv is invalid.");
    }

    // validate card number
    const Cnumber = parseInt(
      cardNumber
        .split(" ")
        .map((str) => str.trim())
        .join("")
    );
    if (typeof cardNumber !== "string") {
      return sendResponse(res, 400, false, "card number is invalid.");
    }
    if (!validateCardNumber(Cnumber)) {
      return sendResponse(res, 400, false, "card number is invalid.");
    }

    try {
      // check if organization exists
      const isOrgExists = await prismaDB.user.findMany({ where: { orgId } });

      if (isOrgExists.length === 0) {
        return sendResponse(
          res,
          404,
          false,
          "Transaction failed: organization no longer exists."
        );
      }

      const transactionId = `tran_${genId().split("-").slice(0, 1).join("")}`;

      const totalAmount = this.#calcTotalAmount(productsPayload);

      let savedItems = [];
      let savedUserInfo = {
        id: genId(),
        transactionId: transactionId,
        orgId,
        username,
        email,
        phonenumber: phonenumber,
        createdAt: this.#currDate,
        status: "pending",
        paid: false,
        totalAmount
      };

      productsPayload.map((prod) => {
        savedItems.push({
          id: genId(),
          tranId: transactionId,
          quantity: parseInt(prod.quantity),
          prodId: prod.productId,
        });
      });

      // save transactions
      const savedProdTran = await prismaDB.transactions.create({
        data: {
          ...savedUserInfo
        }
      });

      // save items data
      const savedProdItems = await prismaDB.items.createMany({
        data: [
          ...savedItems
        ]
      });

      return sendResponse(
        res,
        200,
        true,
        "Goods Purchased successfull.",
        { savedProdTran, savedProdItems }
      );
    } catch (e) {
      console.log("Something went wrong during goods payment. " + e.message);
      return sendResponse(
        res,
        500,
        false,
        "Something went wrong during goods payment. "
      );
    }
  }

  async getTransactions(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to create transaction, missing payload."
      );
    }

    const { orgId, userId } = payload;

    if (orgId === "" || orgId === undefined) {
      return sendResponse(res, 400, false, "failed to fetch: organization ID is missing");
    }
    if (userId === "" || userId === undefined) {
      return sendResponse(res, 400, false, "failed to fetch: userId id is missing");
    }

    // validate id's
    const orgInfo = await prismaDB.user.findMany({
      where: { orgId }
    })

    // check if userExists
    const doesUserExists = await prismaDB.user.findMany({
      where: { id: userId }
    })

    // check if the organization fetching transactions info  are authorised.
    const filteredOrg = orgInfo.filter(data => data.id === userId)

    if (orgInfo.length === 0) {
      return sendResponse(res, 404, false, "fetching transaction failed: no organization with this id.")
    }

    if (doesUserExists.length === 0) {
      return sendResponse(res, 404, false, "Failed to fetch transaction: user does'nt exist")
    }


    if (filteredOrg.length === 0) {
      return sendResponse(res, 401, false, "Unauthorised user to fetch transactions details.")
    }


    // else fetch the data
    try {

      const allTransactions = await prismaDB.transactions.findMany({
        where: { orgId },
        include: { items: true }
      })

      return sendResponse(res, 201, true, "transaction fetched successfully", { transactions: allTransactions })

    } catch (e) {
      console.log(e.mesage);
      return sendResponse(res, 500, true, "Something went wrong fetching transactions " + e.message)
    }
  }

  // APPROVE TRANSACTION
  async approveTransaction(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to approve transaction, missing payload."
      );
    }

    const { trackingId, orgId, userId } = payload;

    if (trackingId === "" || trackingId === undefined) {
      return sendResponse(res, 400, false, "failed to approve transaction: tracking ID is missing");
    }
    if (userId === "" || userId === undefined) {
      return sendResponse(res, 400, false, "failed to approve transaction: userId is missing");
    }

    if (orgId === "" || orgId === undefined) {
      return sendResponse(res, 400, false, "failed to approve transaction: organization ID is missing");
    }

    // validate id's
    const orgInfo = await prismaDB.user.findMany({
      where: { orgId }
    })

    // check if userExists
    const doesUserExists = await prismaDB.user.findMany({
      where: { id: userId }
    })

    // does trackingId exists
    const doesTrackingIdExists = await prismaDB.transactions.findMany({
      where: { transactionId: trackingId }
    })

    // check if the organization fetching transactions info  are authorised.
    const filteredOrg = orgInfo.filter(data => data.id === userId)

    if (orgInfo.length === 0) {
      return sendResponse(res, 404, false, "fetching transaction failed: no organization with this id.")
    }

    if (doesUserExists.length === 0) {
      return sendResponse(res, 404, false, "Failed to approve transaction: user does'nt exist")
    }

    if (doesTrackingIdExists.length === 0) {
      return sendResponse(res, 404, false, "Failed to approve transaction: tracking ID is invalid.")
    }

    if (filteredOrg.length === 0) {
      return sendResponse(res, 401, false, "Not Unauthorised to approve transactions.")
    }

    // check if organization approving were the same user who owns the acct

    const checkOwnership = doesTrackingIdExists.filter(transaction => transaction.orgId === orgId)

    if (checkOwnership.length === 0) {
      return sendResponse(res, 403, false, "Not Unauthorised to approve transactions. 'orgId' ")
    }

    // grant transaction
    try {

      const approve = await prismaDB.transactions.update({
        where: {
          transactionId: trackingId
        },
        data: {
          paid: true,
          status: "approved"
        }
      })

      // generate and send reciept
      this.#sendCustomerReceipt(trackingId, orgId)

      return sendResponse(res, 201, true, "Transaction Approved", { transaction: approve })
    } catch (e) {
      console.log(e);
      return sendResponse(res, 500, false, "something went wrong approving transaction. " + e.message)
    }
  }

  // DENY TRANSACTION
  async denyTransaction(res, payload) {
    if (res === undefined) {
      throw new Error("expected a valid 'res' object but got none ");
    }
    if (Object.entries(payload).length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "failed to deny transaction, missing payload."
      );
    }

    const { trackingId, orgId, userId } = payload;

    if (trackingId === "" || trackingId === undefined) {
      return sendResponse(res, 400, false, "failed to deny transaction: organization ID is missing");
    }
    if (userId === "" || userId === undefined) {
      return sendResponse(res, 400, false, "failed to deny transaction: userId id is missing");
    }

    if (orgId === "" || orgId === undefined) {
      return sendResponse(res, 400, false, "failed to deny transaction: organization ID is missing");
    }

    // validate id's
    const orgInfo = await prismaDB.user.findMany({
      where: { orgId }
    })

    // check if userExists
    const doesUserExists = await prismaDB.user.findMany({
      where: { id: userId }
    })

    // does trackingId exists
    const doesTrackingIdExists = await prismaDB.transactions.findMany({
      where: { transactionId: trackingId }
    })

    // check if the organization fetching transactions info  are authorised.
    const filteredOrg = orgInfo.filter(data => data.id === userId)

    if (orgInfo.length === 0) {
      return sendResponse(res, 404, false, "fetching transaction failed: no organization with this id.")
    }

    if (doesUserExists.length === 0) {
      return sendResponse(res, 404, false, "Failed to deny transaction: user does'nt exist")
    }

    if (doesTrackingIdExists.length === 0) {
      return sendResponse(res, 404, false, "Failed to deny transaction: tracking ID is invalid.")
    }

    if (filteredOrg.length === 0) {
      return sendResponse(res, 401, false, "Not Unauthorised to deny transactions.")
    }

    // check if organization denying were the same user who owns the acct

    const checkOwnership = doesTrackingIdExists.filter(transaction => transaction.orgId === orgId)

    if (checkOwnership.length === 0) {
      return sendResponse(res, 403, false, "Not Unauthorised to deny transactions. 'orgId' ")
    }

    // grant transaction
    try {

      const deniedTransaction = await prismaDB.transactions.update({
        where: {
          transactionId: trackingId
        },
        data: {
          paid: false,
          status: "denied"
        }
      })


      return sendResponse(res, 201, true, "Transaction Denied", { transaction: deniedTransaction })

    } catch (e) {
      console.log(e);
      return sendResponse(res, 500, false, "something went wrong denying transaction. " + e.message)
    }
  }
}
