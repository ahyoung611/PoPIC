import './App.css'
import {Outlet, Route, Routes} from "react-router-dom"
import Main from "./pages/Main.jsx";
import UserHeader from "./components/commons/UserHeader.jsx";
import Footer from "./components/commons/Footer.jsx";
import VendorHeader from "./components/commons/VendorHeader.jsx";
import AdminHeader from "./components/commons/AdminHeader.jsx";
import VendorMain from "./pages/vendor/VendorMain.jsx";
import AdminMain from "./pages/admin/AdminMain.jsx";
import PopupDetail from "./pages/PopupDetail.jsx";
import BoardList from "./pages/user/BoardList.jsx";
import Join from "./pages/Join.jsx";
import BoardEditor from "./pages/user/BoardEditor.jsx";
import Login from "./pages/Login.jsx";
import VendorPopupForm from "./pages/vendor/VendorPopupForm.jsx";
import NaverCallback from "./pages/user/NaverCallback.jsx";
import UserMyPage from "./pages/user/UserMyPage.jsx";
import AdminPopup from "./pages/admin/AdminPopup.jsx";
import AdminVendor from "./pages/admin/AdminVendor.jsx";
import AdminUser from "./pages/admin/AdminUser.jsx";
import VendorMyPage from "./pages/vendor/VendorMyPage.jsx";
import CheckoutPage from "./pages/Checkout.jsx";
import SuccessPage from "./pages/Success.jsx";
import FailPage from "./pages/Fail.jsx";
import UserProfile from "./pages/user/UserProfile.jsx";
import OperatorReservations from "./pages/vendor/OperatorReservations.jsx";
import OperatorOnsite from "./pages/vendor/OperatorOnsite.jsx";
import MyPopic from "./pages/user/MyPopic.jsx";


function App() {

    function UserHeaderLayout() {
        return (
            <>
                <UserHeader>
                    <Route path="/" element={<Main/>}/>
                    <Route path="/popups" element={<Main/>}/>
                    <Route path="/community" element={<Main/>}/>
                </UserHeader>
                <Outlet></Outlet>
            </>
        );
    }

    function VendorHeaderLayout() {
        return (
            <>
                <VendorHeader>
                    <Route path="/vendorPopups" element={<VendorMain/>}/>
                    <Route path="/vendorPopups/new" element={<VendorMain/>}/>
                    <Route path="/vendor/popups/edit" element={<VendorMain/>}/>
                    <Route path="/vendor/reservations" element={<VendorMain/>}/>
                    <Route path="/vendor/onsite" element={<VendorMain/>}/>
                </VendorHeader>
                <Outlet></Outlet>
            </>
        )
    }

    function AdminHeaderLayout() {
        return (
            <>
                <AdminHeader>
                    <Route path="/" element={<AdminMain/>}/>
                </AdminHeader>
                <Outlet></Outlet>
            </>
        )
    }

    function FooterLayout() {
        return (
            <>
                <Outlet></Outlet>
                <Footer></Footer>
            </>
        )
    }

    return (
        <Routes>
            <Route element={<FooterLayout/>}>

                {/* 회원가입 & 로그인(header 필요없음) */}
                <Route path={"/join"} element={<Join/>}></Route>
                <Route path={"/login"} element={<Login/>}></Route>

                {/*일반 유저 Layout */}
                <Route element={<UserHeaderLayout/>}>
                    <Route path={"/"} element={<Main/>}></Route>
                    <Route path={"/popupStore/detail/:id"} element={<PopupDetail/>}></Route>
                    <Route path={"/join"} element={<Join/>}></Route>
                    <Route path={"/board"} element={<BoardList/>}></Route>
                    <Route path={"/board/new"} element={<BoardEditor/>}></Route>
                    <Route path={"/board/:id"} element={<BoardEditor/>}></Route>
                    <Route path={"/board/:id/edit"} element={<BoardEditor/>}></Route>
                    <Route path={"/userMyPage/:userId"} element={<UserMyPage/>} />
                    <Route path={"/userMyPage/profile/:userId"} element={<UserProfile />} />
                    <Route path={"/checkout"} element={<CheckoutPage/>}></Route>
                    <Route path={"/success"} element={<SuccessPage />} />
                    <Route path={"/fail"} element={<FailPage />} />
                    <Route path={"/me/popic"} element={<MyPopic />} />
                </Route>

                {/*벤더 유저 Layout */}
                <Route element={<VendorHeaderLayout/>}>
                    <Route path="/vendor/:vendorId/popups" element={<VendorMain/>} />
                    <Route path="/vendor/:vendorId/popups/new" element={<VendorPopupForm/>} />
                    <Route path="/vendor/:vendorId/popups/edit/:popupId" element={<VendorPopupForm/>} />
                    <Route path="/vendor/myPage/:vendorId" element={<VendorMyPage/>} />
                    <Route path={"/vendor/reservations"} element={<OperatorReservations/>}></Route>
                    <Route path={"/vendor/onsite"} element={<OperatorOnsite/>}></Route>
                </Route>

                {/*어드민 Layout */}
                <Route element={<AdminHeaderLayout/>}>
                    <Route path="/admin" element={<AdminMain/>}></Route>
                    <Route path="/admin/popupManage" element={<AdminPopup/>}></Route>
                    <Route path="/admin/vendorManage" element={<AdminVendor/>}></Route>
                    <Route path="/admin/userManage" element={<AdminUser/>}></Route>
                </Route>

            </Route>
            <Route path={"/naver/callback"} element={<NaverCallback/>}></Route>
        </Routes>
    )
}

export default App
