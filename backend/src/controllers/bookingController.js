import { Property } from "../Models/propertyModel.js";
import { Booking } from "../Models/bookingModel.js";


const createOrder = async (req, res) => {
    try {
        const {
            amount,
            propertyId,
            fromDate,
            toDate,
            guests
        } = req.body;

        const orderId = "order_" + Date.now();

        res.status(200).json({
            success: true,
            message: "Order created successfully",
            orderId,
            amount,
            propertyId,
            fromDate,
            toDate,
            guests
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


const verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            bookingDetails,
            forceStatus
        } = req.body;

        if (forceStatus === "success") {

            const newBooking = await Booking.create({
                user: req.user._id,
                property: bookingDetails.propertyId,
                price: bookingDetails.price,
                fromDate: bookingDetails.fromDate,
                toDate: bookingDetails.toDate,
                guests: bookingDetails.guests,
                numberOfnights: bookingDetails.numberOfnights,
                paid: true
            });

            await Property.findByIdAndUpdate(
                bookingDetails.propertyId,
                {
                    $push: {
                        currentBookings: {
                            bookingId: newBooking._id,
                            fromDate: bookingDetails.fromDate,
                            toDate: bookingDetails.toDate
                        }
                    }
                },
                {
                    new: true
                }
            );

            res.status(200).json({
                success: true,
                message: "Payment verified and booking created successfully",
                orderId,
                booking: newBooking
            });

        } else {

            res.status(400).json({
                success: false,
                message: "Payment verification failed",
                orderId
            });
        }

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id });
        res.status(200).json({
            success: true,
            data:{
            bookings
            }
        })
    }catch (error) {
        res.status(401).json({
            status: false,
            message: error.message
        })
    }
}

const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        res.status(200).json({
            success: true,
            data:{
                booking
            }
        })
    }catch (error) {
        res.status(401).json({
            status: false,
            message: error.message
        })
    }
}
export {
    getUserBookings,
    getBookingDetails,
    createOrder,
    verifyPayment
};