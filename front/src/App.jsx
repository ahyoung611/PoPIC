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


function App() {

    function UserHeaderLayout() {
        return (
            <>
                <UserHeader>
                    <Route path="/" element={<Main/>} />
                    <Route path="/popups" element={<Main/>} />
                    <Route path="/community" element={<Main/>} />
                </UserHeader>
                <Outlet></Outlet>
            </>
        );
    }

    function VendorHeaderLayout() {
        return (
            <>
                <VendorHeader>
                    <Route path="/vendor" element={<VendorMain/>}/>
                    <Route path="/vendor/popups" element={<VendorMain/>}/>
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

                {/*일반 유저 Layout */}
                <Route element={<UserHeaderLayout/>}>
                    <Route path={"/"} element={<Main/>}></Route>
                    <Route path={"/popupStore/detail"} element={<PopupDetail/>}></Route>
                    <Route path={"/join"} element={<Join/>}></Route>
                </Route>

                {/*벤더 유저 Layout */}
                <Route element={<VendorHeaderLayout/>}>
                    <Route path="/vendor/popups" element={<VendorMain/>}>

                    </Route>
                </Route>

                {/*어드민 Layout */}
                <Route element={<AdminHeaderLayout/>}>
                    <Route path="/admin" element={<AdminMain/>}></Route>
                </Route>

                {/*소통게시판*/}
                <Route element={<UserHeaderLayout/>}>
                    <Route path="/board" element={<BoardList/>}></Route>
                </Route>

            </Route>
        </Routes>
    )
}

export default App
