import BoardEditor from "./BoardEditor.jsx";
import {useNavigate} from "react-router-dom";

const BoardList = ()=>{
    const nav = useNavigate();

    return(
        <div>
            리스트
            <button onClick={()=>{
                nav("/board/new");
            }}>
                글 작성
            </button>
        </div>
    )
}
export default BoardList;