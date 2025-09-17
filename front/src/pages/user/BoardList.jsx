import {useNavigate} from "react-router-dom";
import Button from "../../components/commons/Button.jsx";
import BoardListView from "../../components/board/BoardListItem.jsx";

const BoardList = () => {
    const nav = useNavigate();

    return (
        <div>
            <h2>게시판</h2>
            <Button onClick={() => nav("/board/new")}>글 작성</Button>
            <BoardListView/>
        </div>
    )
}
export default BoardList;