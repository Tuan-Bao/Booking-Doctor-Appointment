import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import initDB from "../models/index.js";

dotenv.config({ path: "../.env" });

const db = await initDB();
const Payment = db.Payment;
const Appointment = db.Appointment;

class MomoService {
  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE;
    this.accessKey = process.env.MOMO_ACCESS_KEY;
    this.secretKey = process.env.MOMO_SECRET_KEY;
    this.endpoint = process.env.MOMO_ENDPOINT;
    this.returnUrl = process.env.MOMO_RETURN_URL;
    this.ipnUrl = process.env.MOMO_IPN_URL;
  }

  createPaymentRequest(orderId, amount, orderInfo) {
    const requestId = orderId;
    const orderType = "momo_wallet";
    const transId = orderId;
    const extraData = "";
    const redirectUrl = this.returnUrl;

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: this.ipnUrl,
      extraData: extraData,
      requestType: "captureWallet",
      signature: signature,
    };

    return requestBody;
  }

  verifyPaymentResponse(response) {
    const {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      signature,
    } = response;

    const rawSignature = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&resultCode=${resultCode}&message=${message}&payType=${payType}`;

    const expectedSignature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    return signature === expectedSignature;
  }

  async createPayment(orderId, amount, orderInfo) {
    try {
      const requestBody = this.createPaymentRequest(orderId, amount, orderInfo);
      const response = await axios.post(this.endpoint, requestBody);
      return response.data;
    } catch (error) {
      console.log("Error details:", error.response?.data);
      throw new Error("Failed to create MoMo payment: " + error.message);
    }
  }

  async handlePaymentResult(paymentData) {
    try {
      const { amount, orderId, resultCode, message, transId, responseTime } =
        paymentData;
      //   console.log("Payment data received:", paymentData);
      // Extract appointment ID from orderId (format: PAY-{appointment_id}-{timestamp})
      const appointment_id = orderId.split("-")[1];
      //   console.log("Appointment ID:", appointment_id);
      //   console.log("Result code:", resultCode);
      if (resultCode === "0") {
        // Payment successful
        const appointment = await Appointment.findByPk(appointment_id);
        if (!appointment) {
          throw new Error("Appointment not found");
        }
        // console.log("Appointment found:", appointment);

        const payment = await Payment.findOne({
          where: { appointment_id: appointment_id },
        });
        // console.log("Payment found:", payment);
        if (!payment) {
          throw new Error("Payment not found");
        }

        // Update payment status
        await payment.update({
          status: "paid",
          payment_method: "e-wallet",
        });

        return {
          success: true,
          message: "Payment successful",
          appointment_id,
        };
      } else {
        return {
          success: false,
          message: message || "Payment failed",
          appointment_id,
        };
      }
    } catch (error) {
      console.error("Error handling payment result:", error);
      throw error;
    }
  }
}

export default new MomoService();
