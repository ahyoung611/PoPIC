import BoardEditor from "./BoardEditor.jsx";
import {useNavigate} from "react-router-dom";
import Button from "../../components/commons/Button.jsx";

const BoardList = ()=>{
    const nav = useNavigate();

    return(
        <div>
            리스트
            <Button onClick={ ()=>{ nav("/board/new")}  }>글 작성</Button>
        </div>
    )
}
export default BoardList;