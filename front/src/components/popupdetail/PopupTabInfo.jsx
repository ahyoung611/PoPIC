import {useEffect, useState} from "react";
import apiRequest from "../../utils/apiRequest.js";

const PopupTabInfo = (props)=>{
    console.log(props);
    const [popupSchedule, setPopupSchedule] = useState([]);

    useEffect(()=>{
        const fetchPopupDetail = async () => {
            const response = await apiRequest(`/popupStore/popupSchedule?popupId=`+ props.popup.store_id, {
                credentials: "include",
            });
            setPopupSchedule(response);
        }
        fetchPopupDetail();

        const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
        const scriptId = "kakao-map-script";

        const initKakaoMap = () => {
            const container = document.getElementById("map");
            if (!container) return;
            const options = {
                center: new window.kakao.maps.LatLng(33.450701, 126.570667),
                level: 3
            };
            new window.kakao.maps.Map(container, options);
        };

        if (window.kakao && window.kakao.maps) {
            initKakaoMap();
        } else if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                window.kakao.maps.load(initKakaoMap);
            };
        }
    },[])

    function copyLocation(){
        const textToCopy = props.popup.address + " " + props.popup.address_detail;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert("주소가 복사되었습니다!"); // 복사 완료 메시지
            })
            .catch((err) => {
                console.error("복사 실패:", err);
            });
    }



    return(
        <div className={"popup-tab-info"}>
            <div className={"open-time"}>
                <h3>운영시간</h3>
                <p>월~일 : 11:00 ~ 21:00</p>
            </div>
            <div className={"popup-description"}>
                <h3>팝업스토어 소개</h3>
                <div className={"content"}>
                    {props.popup.description}
                </div>
            </div>

            <div className={"popup-location"}>
                <h3>오시는 길</h3>
                <div id={"map"}></div>
                <p className={"copyLocation"} onClick={copyLocation}>{props.popup.address + " " + props.popup.address_detail}</p>
            </div>
        </div>
    )
}

export default PopupTabInfo;