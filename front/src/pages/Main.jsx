import { useAuth } from "../context/AuthContext";

const Main = () => {
    const {auth} = useAuth();

    return (
        <>
            <div>{auth.user && (auth.user.name)}</div>
        </>
    );
}

export default Main