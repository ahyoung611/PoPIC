import Button from "../commons/Button.jsx";

const PopupInfo = (props)=>{
    const popup = props.popup;
    console.log("popup: ",popup);
    return(
        <div className="popupInfo">
            <div className={"popup-title"}>{popup.store_name}</div>
            <div className={"popup-date"}>{popup.start_date}~{popup.end_date}</div>
            <div className={"popup-address"}>{popup.address} {popup.address_detail}</div>
            {new Date(popup.end_date) >= new Date().setHours(0,0,0,0) ?(
                <Button variant={"primary"} color={"red"}>현장 발권</Button>
            ):(
                <Button variant={"label"} color={"gray"} disabled={true}>운영 종료</Button>
            )}

        </div>
    )
}

export default PopupInfo