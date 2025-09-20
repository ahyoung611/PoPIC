import PopupImage from "../../components/popupdetail/PopupImage.jsx";

const PopupDetailModal = ({popup, isOpen, onClose})=>{
    if (!isOpen) return null;


    return (
        <div className="popupDetailModal">
            <div className={"popup-name"}>
                <p>{popup.store_name}</p>
            </div>

            <PopupImage images={popup.images}/>

            <div className={"popup-period"}>
                <p>{popup.start_date} ~ {popup.end_date}</p>
            </div>

            <div className={"popup-manager"}>
                <p>{popup.vendor.manager_name}</p>
            </div>

            <div className={"popup-phoneNumber"}>
                <p>{popup.vendor.phone_number}</p>
            </div>

            <div className={"popup-category"}>
                <p>{popup.category_names}</p>
            </div>

            <div className={"popup-address"}>
                <p>{popup.address} {popup.address_detail}</p>
            </div>

            <div className={"popup-description"}>
                <p>{popup.description}</p>
            </div>

            <button
                onClick={onClose}
            >
                ✕
            </button>
        </div>
    )
}

export default PopupDetailModal;