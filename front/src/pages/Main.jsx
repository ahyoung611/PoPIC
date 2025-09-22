import { useAuth } from "../context/AuthContext";

const Main = () => {
    const {auth} = useAuth();
    console.log(auth);

    return (
        <>
            <div>{auth.user && (auth.user.name)}</div>
        </>
    );
}

export default Main