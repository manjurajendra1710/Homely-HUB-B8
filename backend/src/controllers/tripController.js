import { Property } from "../Models/propertyModel.js";
import { generateTripPlan } from "../ai/tripPlanner.js";
import { generateDescription } from "../ai/generateDescription.js";

// Different users type the same place differently ("Goa", "GOA", "goa ").
// Properties are stored lowercase with no spaces (see propertyModel.js's
// pre-save hook), so normalize the destination the same way before matching.
const toLowerCase = (value) => value.trim().toLowerCase().replaceAll(" ", "");

const planTrip = async (req, res) => {
  try {
    // 1. Receive the user's information
    const { destination, budget, days, people, interests } = req.body;

    // 2. Validate the required information
    if (!destination || !budget || !days || !people) {
      throw new Error("Please provide destination, budget, days and people");
    }

    const numericBudget = Number(budget);
    const numericDays = Number(days);

    if (
      Number.isNaN(numericBudget) ||
      Number.isNaN(numericDays) ||
      numericBudget <= 0 ||
      numericDays <= 0
    ) {
      throw new Error("Budget and days must be positive numbers");
    }

    // 3. Send the information to our AI trip planner
    const plan = await generateTripPlan({
      destination,
      budget: numericBudget,
      days: numericDays,
      people,
      interests,
    });

    // 4. Calculate the budget per night
    const perNight = Math.round(numericBudget / numericDays);

    // 5. Search MongoDB for suitable properties
    const destinationKey = toLowerCase(destination);

    const properties = await Property.find({
      $and: [
        {
          $or: [
            { "address.city": destinationKey },
            { "address.state": destinationKey },
            { "address.area": destinationKey },
          ],
        },
        { price: { $lte: perNight } },
      ],
    })
      .select("propertyName address price images")
      .limit(6);

    // 6. Send both the AI trip plan and matching properties back
    res.status(200).json({
      status: "success",
      data: { plan, perNight, properties },
    });
  } catch (error) {
    console.error("planTrip failed:", error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const writeDescription = async (req, res) => {
  try {
    const {
      propertyName,
      extraInfo,
      propertyType,
      roomType,
      maximumGuest,
      amenities,
      price,
      address,
    } = req.body;

    if (!propertyName || !propertyType || !roomType || !maximumGuest || !price) {
      throw new Error(
        "Please provide propertyName, propertyType, roomType, maximumGuest and price"
      );
    }

    const description = await generateDescription({
      propertyName,
      extraInfo,
      propertyType,
      roomType,
      maximumGuest,
      amenities,
      price,
      address,
    });

    res.status(200).json({
      status: "success",
      data: { description },
    });
  } catch (error) {
    console.error("writeDescription failed:", error);
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export { planTrip, writeDescription };
