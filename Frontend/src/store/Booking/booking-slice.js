import { createSlice } from "@reduxjs/toolkit";

const bookingSlice = createSlice({
  name: "booking",

  initialState: {
    bookings: [],
    bookingDetails: null,
    loading: false,
    error: null
  },

  reducers: {
    // managing booking: request/loading state shared by all booking fetches
    getBookingsRequest(state) {
      state.loading = true;
    },
    getBookingDetailsRequest(state) {
      state.loading = true;
    },
    createBookingRequest(state) {
      state.loading = true;
    },

    // store all bookings (GET /booking)
    getBookings(state, action) {
      state.bookings = action.payload;
      state.loading = false;
    },

    // store individual booking (GET /booking/:bookingId)
    getBookingDetails(state, action) {
      state.bookingDetails = action.payload;
      state.loading = false;
    },

    // store the individual booking once it is created, and update its
    // dates/details with exactly what the backend sent back (verify-payment)
    createBookingSuccess(state, action) {
      state.bookingDetails = action.payload;
      state.bookings = [action.payload, ...state.bookings];
      state.loading = false;
    },

    getErrors(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    }
  }
});

export const bookingActions = bookingSlice.actions;
export default bookingSlice;
