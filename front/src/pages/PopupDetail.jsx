import PopupImage from "../components/popupdetail/PopupImage.jsx";
import PopupInfo from "../components/popupdetail/PopupInfo.jsx";
import PopupDetailTab from "../components/popupdetail/PopupDetailTab.jsx";
import {useEffect, useState} from "react";
import apiRequest from "../utils/apiRequest.js";
import '../style/popupDetail.css';

const PopupDetail = ()=>{
    const [popupDetail, setPopupDetail] = useState(null);

    useEffect(()=>{
        const fetchPopupDetail = async () => {
            const response = await apiRequest(`/popupStore/popupDetail?id=1`, {
                credentials: "include",
            });
            console.log("response: ",response);
            setPopupDetail(response);
        }
        fetchPopupDetail();
    },[])

    return(
        <div className={"popupStore-detail"}>
            {popupDetail ? (
                <>
                    <PopupImage images={popupDetail.images}></PopupImage>
                    <PopupInfo popup={popupDetail}></PopupInfo>
                    <PopupDetailTab popup={popupDetail}></PopupDetailTab>
                </>
            ) : (<p>loading...</p>)}
        </div>
    )
}

export default PopupDetail