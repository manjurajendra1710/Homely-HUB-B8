import { bookingActions } from "./booking-slice";
import { axiosInstance } from "../../utils/axios";

// store all bookings
export const getUserBookings = () => async (dispatch) => {
  try {
    dispatch(bookingActions.getBookingsRequest());
    const { data } = await axiosInstance.get("/v1/rent/booking");
    dispatch(bookingActions.getBookings(data.data.bookings));
  } catch (error) {
    dispatch(
      bookingActions.getErrors(error.response?.data?.message || error.message)
    );
  }
};

// store an individual booking
export const getBookingDetails = (bookingId) => async (dispatch) => {
  try {
    dispatch(bookingActions.getBookingDetailsRequest());
    const { data } = await axiosInstance.get(`/v1/rent/booking/${bookingId}`);
    dispatch(bookingActions.getBookingDetails(data.data.booking));
  } catch (error) {
    dispatch(
      bookingActions.getErrors(error.response?.data?.message || error.message)
    );
  }
};

// starts a payment order for a property; doesn't create a booking yet, so
// nothing is stored in the slice — the caller uses the returned order to
// drive the payment step, then calls verifyPayment below.
export const createOrder = (orderData) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.post(
      "/v1/rent/booking/create-order",
      orderData
    );
    return data;
  } catch (error) {
    dispatch(
      bookingActions.getErrors(error.response?.data?.message || error.message)
    );
  }
};

// confirms payment and creates the booking; stores the individual booking
// the backend just created, with the fromDate/toDate it sent back
export const verifyPayment = (paymentData) => async (dispatch) => {
  try {
    dispatch(bookingActions.createBookingRequest());
    const { data } = await axiosInstance.post(
      "/v1/rent/booking/verify-payment",
      paymentData
    );
    dispatch(bookingActions.createBookingSuccess(data.booking));
    return data;
  } catch (error) {
    dispatch(
      bookingActions.getErrors(error.response?.data?.message || error.message)
    );
  }
};
