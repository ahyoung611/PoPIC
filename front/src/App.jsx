import './App.css'
import {Routes, Route, Link, BrowserRouter, Outlet} from "react-router-dom"
import Main from "./pages/Main.jsx";
import UserHeader from "./components/UserHeader.jsx";
import Footer from "./components/Footer.jsx";
import VendorHeader from "./components/VendorHeader.jsx";
import AdminHeader from "./components/AdminHeader.jsx";
import VendorMain from "./pages/VendorMain.jsx";
import AdminMain from "./pages/AdminMain.jsx";

function App() {

    function UserHeaderLayout(){
        return(
        <>
            <UserHeader></UserHeader>
            <Outlet></Outlet>
        </>
        );
    }

    function VendorHeaderLayout(){
        return(
            <>
                <VendorHeader></VendorHeader>
                <Outlet></Outlet>
            </>
        )
    }

    function  AdminHeaderLayout(){
        return(
            <>
                <AdminHeader></AdminHeader>
                <Outlet></Outlet>
            </>
        )
    }

    function FooterLayout(){
        return(
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
                    <Route path="/" element={<Main/>}></Route>
                </Route>

                {/*벤더 유저 Layout */}
                <Route element={<VendorHeaderLayout/>}>
                    <Route path="/vendor" element={<VendorMain/>}></Route>
                </Route>

                {/*어드민 Layout */}
                <Route element={<AdminHeaderLayout/>}>
                    <Route path="/admin" element={<AdminMain/>}></Route>
                </Route>

            </Route>
        </Routes>
  )
}

export default App
