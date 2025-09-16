const BoardEditor = () => {

    return (
        <div>
            <h2>게시글 작성</h2>
            <div>
                <form action="/board/new" method={"POST"}>
                    제목 <input type="text" name={"boardTitle"}/>
                    {/*이미지 <input type=""/>*/}
                    내용 <textarea name="boardContent" id="boardContent" cols="30" rows="10"></textarea>
                </form>
            </div>
        </div>
    )
}
export default BoardEditor;