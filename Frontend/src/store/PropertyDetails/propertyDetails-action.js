import{propertDetailsAction} from "./propertyDetials-slice";
import {axiosInstance} from "../../utils/axios"
export const getPropertyDetails =(id)=> async(dispatch)=>{
    try{
        dispatch(propertDetailsAction.getListRequest());
        const response = await axiosInstance(`/v1/rent/listing/${id}`)
        console.log(response);
        if(!response){
            throw new Error ("could not fetch my propertyDetails")
        }
        const{data} = response.data;
        dispatch(propertDetailsAction.getPropertyDetails(data))
    }catch(error){
        dispatch(propertDetailsAction.getErrors(error.response?.data?.message || error.message))
    }
}