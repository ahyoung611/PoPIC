import { useState } from "react";

const Join = ()=>{
    const [role, setRole] = useState("USER");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        // USER
        login_id: "",
        email: "",
        password: "",
        name: "",
        phone_number: "",
        // VENDOR
        vendor_name: "",
        manager_name: "",
        brn: "",
    });

    return(
        <>
            <h1>회원가입</h1>
        </>
    )
}

export default Join;