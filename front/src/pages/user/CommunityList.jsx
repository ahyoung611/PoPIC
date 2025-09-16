import CommunityEditor from "./CommunityEditor.jsx";
import {useNavigate} from "react-router-dom";

const CommunityList = ()=>{
    const nav = useNavigate();

    return(
        <div>
            리스트
            <button onClick={()=>{
                nav("/community/new");
            }}>
                글 작성
            </button>
        </div>
    )
}
export default CommunityList;