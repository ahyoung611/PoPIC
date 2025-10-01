import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/commons/Button.jsx";
import "../style/checkout.css";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const people = Number(searchParams.get("people"));
  const unitPrice = Number(searchParams.get("price") || 0);
  const total = unitPrice * people;

  const [amount, setAmount] = useState({ currency: "KRW", value: total });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);

  const { auth } = useAuth();
  const user = auth?.user;
  const popupId = searchParams.get("popupId");
  const slotId = searchParams.get("slotId");

  useEffect(() => {
    (async () => {
      const tossPayments = await loadTossPayments(clientKey);
      const w = tossPayments.widgets({ customerKey });
      setWidgets(w);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!widgets) return;
      await widgets.setAmount(amount);
      await widgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });
      await widgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });
      setReady(true);
    })();
  }, [widgets, amount]);

  const requestPay = async () => {
    if (!widgets) return;
    await widgets.requestPayment({
      orderId: generateRandomString(),
      orderName: `${searchParams.get("name")} 예약`,
      successUrl:
        window.location.origin +
        `/success?people=${people}&popupId=${popupId}&slotId=${slotId}&amount=${amount.value}&date=${searchParams.get(
          "date"
        )}`,
      failUrl: window.location.origin + "/fail",
      customerName: user?.name ?? "",
      customerEmail: user?.email ?? "",
    });
  };

  return (
<div className="container">
  <div className="inner">
    <main className="checkout">
      <section className="checkout-wrapper">
        <header className="checkout-head">
          <h1 className="checkout-title">결제하기</h1>
        </header>

        {/* 결제 위젯 */}
        <div id="payment-method" />
        <div id="agreement" />

        {/* 금액 요약 */}
        <div className="pay-amount" aria-live="polite">
          <div className="pay-amount__row">
            <span className="label">인원</span>
            <span className="value">{people.toLocaleString()}명</span>
          </div>
          <div className="pay-amount__row">
            <span className="label">1인 가격</span>
            <span className="value">
              {unitPrice.toLocaleString()}<span className="unit">원</span>
            </span>
          </div>
          <div className="pay-amount__divider" />
          <div className="pay-amount__row total">
            <span className="label">총 결제금액</span>
            <strong className="value">
              {amount.value.toLocaleString()}
              <span className="unit">원</span>
            </strong>
          </div>
        </div>

        {/* CTA */}
        <div className="btn-wrap">
          <Button
            variant="primary"
            color="red"
            className="btn pay-cta"
            disabled={!ready}
            onClick={requestPay}
          >
            결제하기
          </Button>
        </div>
      </section>
    </main>
  </div>
 </div>
  );
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
