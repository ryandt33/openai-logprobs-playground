import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Init from "./pages/APIKey";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Init />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
