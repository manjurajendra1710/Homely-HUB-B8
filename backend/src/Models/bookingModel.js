import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema({
    property:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: [true,"booking must belong to a property"]
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true,"booking must belong to a user"]
    },
    price:{
        type: Number,
        required: [true,"booking must have a price"]
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    paid:{
        type: Boolean,
        default: true
    },
    fromDate:{
        type: Date,
    },
    toDate:{
        type: Date,
    },
    guests:{
        type: Number,
    },
    numberOfnights:{
        type: Number,
    }
},
{timestamps:true}
);

bookingSchema.pre(/^find/,function(next){
    this.populate("user");
        
        this.populate({
        path:"property",
        select: " maximumGuest images propertyName address price"
    });
    
})
const Booking = mongoose.model("Booking",bookingSchema);
export {Booking};