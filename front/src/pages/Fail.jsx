import { useSearchParams, useNavigate } from "react-router-dom";
import Button from "../components/commons/Button.jsx";
import "../style/fail.css";
import FloatingBg from "../components/commons/FloatingBg";

const bgImgs = [
  "/favicon.png",
  "/bgIcon/Picon.png",
  "/bgIcon/Oicon.png",
  "/bgIcon/Picon.png",
  "/bgIcon/Iicon.png",
  "/bgIcon/Cicon.png",
];

export default function FailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code") || "-";
  const message = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="container fail-container">
      <FloatingBg images={bgImgs} count={8} opacity={0.5} />
      <div className="inner">
        <div className="fail-card">

          <div className="fail-illustration" aria-hidden>
            <img src="/failBoy.png" alt="죄송합니다" />
            <p className="fail-message">결제 실패</p>
          </div>

          <div className="fail-title-box">
              <h3 className="fail-title">결제가 정상 처리되지 않았어요.</h3>
              <p className="fail-subtitle">
                다시 시도하거나, 아래 실패 사유를 참고해주세요.
              </p>
           </div>

          {/* 오류 정보 */}
          <div className="fail-info">
            <div className="info-row">
               <span className="label">실패 사유</span>
            </div>
            <div className="info-row">
              <span className="value">{message}</span>
            </div>
          </div>

          {/* 참고 힌트 */}
          <ul className="fail-hints">
            <li>카드 정보와 한도/잔액을 확인해 주세요.</li>
            <li>네트워크 연결 상태를 점검한 뒤 다시 시도해 주세요.</li>
          </ul>

          {/* 버튼 */}
          <div className="fail-actions">
            <Button
              variant="outline"
              color="gray"
              onClick={() => navigate(-1)}
            >
              이전으로
            </Button>
            <Button
              variant="primary"
              color="red"
              onClick={() => navigate("/main")}
            >
              홈으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
