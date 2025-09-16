import PopupImage from "../components/popupdetail/PopupImage.jsx";
import PopupInfo from "../components/popupdetail/PopupInfo.jsx";
import PopupDetailTab from "../components/popupdetail/PopupDetailTab.jsx";
import {useEffect} from "react";
import apiRequest from "../utils/apiRequest.js";

const PopupDetail = ()=>{

    useEffect(()=>{
        const fetchPopupDetail = async () => {
            console.log("Fetching popup detail...");
            const response = await apiRequest(`/popupStore/popupDetail`, {
                credentials: "include",
            });
        }
        fetchPopupDetail();
    },[])


    return(
        <div className={"popupStore-detail"}>
            <PopupImage></PopupImage>
            <PopupInfo></PopupInfo>
            <PopupDetailTab></PopupDetailTab>
        </div>
    )
}

export default PopupDetail