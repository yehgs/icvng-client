// client/src/utils/sendBookingRequest.js
// Posts the booking to the server, which emails it via Resend. Nothing is stored.
import Axios from "./Axios";
import SummaryApi from "../common/SummaryApi";

export async function sendBookingRequest(payload) {
  const { data } = await Axios({ ...SummaryApi.submitBookingRequest, data: payload });
  if (!data?.success) throw new Error(data?.message || "Failed");
  return data;
}
