import slugify from "slugify";
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
  propertyName: {
    type: String,
    required: [ true,  "Please enter a property name" ],
    unique: true
  },
  description: {
    type: String,
    required: [ true,  "Please enter a description" ]
  },
  extraInfo:{
    type: String,
    default:"checkin on time. good services."
  },
  propertyType: {
    type: String,
    enum: ["House", "Flat","Guest House","Hotel"],
    default: "House"
 },
 roomType: {
    type: String,
    enum: ["Anytype", "Room","Entire Home"],
    default: "Anytype"
 },
 maximumGuest: {
    type: Number,
    required: [ true,  "Please enter the maximum number of guests" ]
 },
 amenities: [
    {
        name:{
            type: String,
            required: true,
            enum:[
                "Wifi",
                "Kitchen",
                "Free Parking",
                "Washing Machine",
                "Tv",
                "Pool",
                "Ac"
            ]
        },
        icon:{
            type: String,
            required: true
        }
    }
 ],
  price: {
    type: Number,
    required:[true,"Please enter the price of the property"],
    default:500
  },
  address: {
    area:String,
    city:String,
    state:String,
    pincode:Number
  },
  images: {
    type: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    validate:{
        validator:function(arr) {
            return arr.length >=6;
        },
        message: "Please upload at least 6 images"
    }
  },
  currentBookings:[
        {
            bookingId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking"
            },
            fromDate:{
                type: Date,
            },
            toDate:{
                type: Date,
            },
            userId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
  ],
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },


  slug:String,
  checkInTime:{
    type: String,
    default:"11:00"
  },
  checkOutTime:{
    type: String,
    default:"13:00"
  }
})

propertySchema.pre("save", function() {
  this.slug = slugify(this.propertyName, { lower: true });
})
propertySchema.pre("save", function() {
    
        this.address.city = this.address.city.toLowerCase().replaceAll(" ","");
    })

const Property = mongoose.model.Property|| mongoose.model("Property", propertySchema);
export {Property};

