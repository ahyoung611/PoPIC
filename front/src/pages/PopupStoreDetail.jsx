import PopupStoreImage from "../components/popupstoredetail/PopupStoreImage.jsx";
import PopupStoreInfo from "../components/popupstoredetail/PopupStoreInfo.jsx";
import PopupDetailTab from "../components/popupstoredetail/PopupDetailTab.jsx";

const PopupStoreDetail = ()=>{

    return(
        <div className={"popupStore-detail"}>
            <PopupStoreImage></PopupStoreImage>
            <PopupStoreInfo></PopupStoreInfo>
            <PopupDetailTab></PopupDetailTab>
        </div>
    )
}

export default PopupStoreDetail