import { axiosInstance } from "../utils/axios";

export const getTripPlan = async (trip) => {
  const { data } = await axiosInstance.post("/v1/rent/ai/trip-plan", trip);
  return data.data;
};
