import { propertyAction } from "./property-slice";
import { axiosInstance } from "../../utils/axios";

export const getAllProperties = () => async (dispatch, getState) => {
  try {
    console.log("API call started");

    dispatch(propertyAction.getRequest());

    const { searchParams } = getState().properties;

    console.log(searchParams);

    const response = await axiosInstance.get("/v1/rent/listing", {
      params: {
        ...searchParams
      }
    });

    if (!response) {
      throw new Error("Could not fetch any properties");
    }

    const { data } = response;

    console.log(data);

    dispatch(propertyAction.getProperties(data));
  } catch (error) {
    console.error("Property API Error:", error);

    dispatch(
      propertyAction.getErrors(
        error.response?.data?.message || error.message
      )
    );
  }
};