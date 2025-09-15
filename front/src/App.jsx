import './App.css'
import {Routes, Route, Link, BrowserRouter} from "react-router-dom"
import Main from "./pages/Main.jsx";

function App() {

    useEffect(() => {
        fetch("http://localhost:8080/react/todos")
            .then(res => res.json())
            .then(data => setTodos(data))
            .catch(err => console.log(err));
    },[])


  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Main/>}></Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App
