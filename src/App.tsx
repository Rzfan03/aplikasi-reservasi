import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AjukanPage from "./pages/AjukanPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ajukan" element={<AjukanPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
