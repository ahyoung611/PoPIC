import {loadTossPayments} from "@tosspayments/tosspayments-sdk";
import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export default function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const people = Number(searchParams.get("people"));
    const [amount, setAmount] = useState({
        currency: "KRW",
        value: Number(searchParams.get("price") * people || 0),
    });
    const [ready, setReady] = useState(false);
    const [widgets, setWidgets] = useState(null);
    const {auth} = useAuth();
    const user = auth?.user;
    const popupId = searchParams.get("popupId");
    const slotId = searchParams.get("slotId");


    useEffect(() => {
        async function fetchPaymentWidgets() {
            const tossPayments = await loadTossPayments(clientKey);
            const widgets = tossPayments.widgets({customerKey});
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
                <div id="payment-method"/>
                {/* 약관 UI */}
                <div id="agreement"/>

                {/* 결제하기 버튼 */}
                <button
                    className="button"
                    style={{marginTop: "30px"}}
                    disabled={!ready}
                    onClick={async () => {
                        await widgets.requestPayment({
                            orderId: generateRandomString(),
                            orderName: `${searchParams.get("name")} 예약`,
                            successUrl: window.location.origin + `/success?people=${searchParams.get("people")}&popupId=${popupId}&slotId=${slotId}&amount=${amount.value}&date=${searchParams.get("date")}`,
                            failUrl: window.location.origin + "/fail",
                            customerName: user.name,
                            customerEmail: user.email,
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
