import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import apiRequest from "../../utils/apiRequest.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../commons/Button.jsx";

const PopupTabInfo = (props) => {
  const [popupSchedule, setPopupSchedule] = useState([]);
  const token = useAuth().getToken();

  useEffect(() => {
    const fetchPopupDetail = async () => {
      const response = await apiRequest(
        `/popupStore/popupSchedule?popupId=${props.popup.store_id}`,
        { credentials: "include" },
        token
      );
      console.log("res", response);
      setPopupSchedule(response || []);
    };
    fetchPopupDetail();

    const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
    const scriptId = "kakao-map-script";

    const initKakaoMap = () => {
      const container = document.getElementById("map");
      if (!container || !window.kakao?.maps) return;

      const options = {
        center: new window.kakao.maps.LatLng(props.popup.latitude, props.popup.longitude),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);
      map.setZoomable(false);

      const markerPosition = new window.kakao.maps.LatLng(props.popup.latitude, props.popup.longitude);

        const imageSrc = "/favicon.png"; // 사용할 이미지 경로
        const imageSize = new window.kakao.maps.Size(40, 40); // 마커 이미지 크기
        const imageOption = { offset: new window.kakao.maps.Point(20, 40) }; // 이미지 기준점 (가운데 하단)

        const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
        const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            image: markerImage, // 여기서 이미지 적용
        });
        marker.setMap(map);
    };

    if (window.kakao?.maps) {
      initKakaoMap();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => window.kakao.maps.load(initKakaoMap);
    }

    // 언마운트 시 이벤트 정리
    return () => {};
  }, [props.popup, token]);

  function copyLocation() {
    const textToCopy = `${props.popup.address} ${props.popup.address_detail || ""}`.trim();
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => alert("주소가 복사되었습니다!"))
      .catch((err) => console.error("복사 실패:", err));
  }

  // CKEditor
  const safeDescription = useMemo(() => {
    const raw = props.popup?.description || "";
    return DOMPurify.sanitize(raw, {
      USE_PROFILES: { html: true },
    });
  }, [props.popup?.description]);

  // 요일+시간 중복 제거
  const uniqueSchedule = useMemo(
    () =>
      Array.from(
        new Set(popupSchedule.map((it) => `${it.dayOfWeek}: ${it.start_time} ~ ${it.end_time}`))
      ),
    [popupSchedule]
  );

  return (
    <div className="popup-tab-info">
      <div className="open-time">
        <h3 className="title">운영시간</h3>
        {uniqueSchedule.length === 0 ? (
          <p>등록된 운영시간이 없습니다.</p>
        ) : (
          uniqueSchedule.map((item, idx) => <p key={idx}>{item}</p>)
        )}
      </div>

      <div className="popup-description">
        <h3 className="title">팝업스토어 소개</h3>
        {/* CKEditor 본문 렌더링 */}
        <div
          className="content ck-content"
          dangerouslySetInnerHTML={{ __html: safeDescription }}
        />
      </div>

      <div className="popup-location">
        <h3 className="title">오시는 길</h3>
        <div id="map" style={{ width: "100%", height: 280, borderRadius: 12 }} />
        <div className="copyLocation">
          <p>{`${props.popup.address} ${props.popup.address_detail || ""}`.trim()}</p>
          <Button variant="ghost" color="red" onClick={copyLocation}>
            복사
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PopupTabInfo;