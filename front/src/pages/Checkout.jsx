import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const [amount, setAmount] = useState({
        currency: "KRW",
        value: Number(searchParams.get("price") || 0),
    });
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);

    useEffect(() => {
        async function fetchPaymentWidgets() {
            const tossPayments = await loadTossPayments(clientKey);
            const widgets = tossPayments.widgets({ customerKey });
            setWidgets(widgets);
        }
        fetchPaymentWidgets();
    }, []);

    useEffect(() => {
        async function renderPaymentWidgets() {
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
        }
        renderPaymentWidgets();
    }, [widgets, amount]);

    const updateAmount = async (newAmount) => {
        setAmount(newAmount);
        await widgets.setAmount(newAmount);
    };

    return (
        <div className="wrapper">
            <div className="box_section">
                {/* 결제 UI */}
                <div id="payment-method" />
                {/* 약관 UI */}
                <div id="agreement" />

                {/* 결제하기 버튼 */}
                <button
                    className="button"
                    style={{ marginTop: "30px" }}
                    disabled={!ready}
                    onClick={async () => {
                        await widgets.requestPayment({
                            orderId: generateRandomString(),
                            orderName: `${searchParams.get("name")} 예약`,
                            successUrl: window.location.origin + "/success",
                            failUrl: window.location.origin + "/fail",
                            customerName: "고객명(추후연결)",
                            customerEmail: "customer@example.com",
                        });
                    }}
                >
                    결제하기
                </button>
            </div>
        </div>
    );
}

function generateRandomString() {
    return window.btoa(Math.random().toString()).slice(0, 20);
}
