import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import CliDocs from "./Pages/CliDocs.jsx";
import Layout from "./layout/layout.jsx";
import Packages from "./Pages/packages_page.jsx";
import Test from "./Pages/test.jsx";
import Download from "./Pages/Download.jsx";
import NotFound from "./Pages/NotFound.jsx";
import UserPage from "./Pages/UserPage.jsx";
import AboutUs from "./Pages/AboutUs.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Authentication Routes */}
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/login" element={<Login />} />

        {/* Standalone Docs Page */}
        <Route path="/docs/cli" element={<CliDocs />} />

        {/* Download Page */}
        <Route path="/download" element={<Download />} />

        {/* Main App Routes with Sidebar Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/package/:language" element={<Packages />} />
          <Route path="/package" element={<Navigate to="/package/python" replace />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/profile" element={<Navigate to="/user" replace />} />
        </Route>

        <Route path="/test" element={<Test />} />
        
        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
