import Button from "../commons/Button.jsx";

const PopupInfo = (props)=>{
    console.log(props);
    const popup = props.popup;
    return(
        <div className="popupInfo">
            <div className={"popup-title"}>{popup.store_name}</div>
            <div className={"popup-date"}>{popup.start_date}~{popup.end_date}</div>
            <div className={"popup-address"}>{popup.address} {popup.address_detail}</div>
            <Button variant="primary" color="red">현장 발권</Button>
        </div>
    )
}

export default PopupInfo