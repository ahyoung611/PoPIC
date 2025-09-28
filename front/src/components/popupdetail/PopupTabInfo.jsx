import {useEffect, useState} from "react";
import apiRequest from "../../utils/apiRequest.js";
import {useAuth} from "../../context/AuthContext.jsx";

const PopupTabInfo = (props)=>{
    const [popupSchedule, setPopupSchedule] = useState([]);
    const token = useAuth().getToken();

    useEffect(()=>{

        const fetchPopupDetail = async () => {
            const response = await apiRequest(`/popupStore/popupSchedule?popupId=`+ props.popup.store_id, {
                credentials: "include",
            },token);
            setPopupSchedule(response);
            console.log(response);
        }
        fetchPopupDetail();

        const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
        const scriptId = "kakao-map-script";

        const initKakaoMap = () => {
            const container = document.getElementById("map");
            if (!container) return;
            const options = {
                center: new window.kakao.maps.LatLng(props.popup.latitude, props.popup.longitude),
                level: 3
            };
            const map = new window.kakao.maps.Map(container, options);
            map.setZoomable(false);
            const markerPosition  = new kakao.maps.LatLng(props.popup.latitude, props.popup.longitude);

            const marker = new kakao.maps.Marker({
                position: markerPosition,
                clickable: true
            });

            marker.setMap(map);

            kakao.maps.event.addListener(marker, 'click', function() {
                copyLocation();
            });
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
    },[props.popup, token])

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


    // 요일 + 시간 조합을 Set으로 중복 제거
    const uniqueSchedule = Array.from(
        new Set(popupSchedule.map(item => `${item.dayOfWeek}: ${item.start_time} ~ ${item.end_time}`))
    );

    return(
        <div className={"popup-tab-info"}>
            <div className={"open-time"}>
                <h3 className={"title"}>운영시간</h3>
                {uniqueSchedule.map((item,index)=>(
                    <p key={index}>{item}</p>
                ))}
            </div>
            <div className={"popup-description"}>
                <h3 className={"title"}>팝업스토어 소개</h3>
                <div className={"content"}>
                    {props.popup.description}
                </div>
            </div>

            <div className={"popup-location"}>
                <h3 className={"title"}>오시는 길</h3>
                <div id={"map"}></div>
                <p className={"copyLocation"} onClick={copyLocation}>{props.popup.address + " " + props.popup.address_detail}</p>
            </div>
        </div>
    )
}

export default PopupTabInfo;