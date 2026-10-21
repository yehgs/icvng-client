// client/src/utils/sendBookingRequest.js
// Posts the booking to the server, which saves it (admin "Booking Requests" page,
// Nigeria team) and emails it via Resend to the recipient list.
import Axios from "./Axios";
import SummaryApi from "../common/SummaryApi";

export async function sendBookingRequest(payload) {
  let language = "en";
  try { language = localStorage.getItem("icvng_language") || "en"; } catch { /* private mode */ }
  const { data } = await Axios({ ...SummaryApi.submitBookingRequest, data: { language, ...payload } });
  if (!data?.success) throw new Error(data?.message || "Failed");
  return data;
}
