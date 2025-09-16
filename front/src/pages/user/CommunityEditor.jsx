const CommunityEditor = () => {

    return (
        <div>
            <h2>게시글 작성</h2>
            <div>
                <form action="/board/new" method={"POST"}>
                    제목 <input type="text" name={"communityTitle"}/>
                    {/*이미지 <input type=""/>*/}
                    내용 <textarea name="communityContent" id="communityContent" cols="30" rows="10"></textarea>
                </form>
            </div>
        </div>
    )
}
export default CommunityEditor;