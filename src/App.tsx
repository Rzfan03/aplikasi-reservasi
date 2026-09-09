import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import AjukanPage from "./pages/AjukanPage";
import StatusPage from "./pages/StatusPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ajukan" element={<AjukanPage />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;