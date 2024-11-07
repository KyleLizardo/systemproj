import { useState } from "react";
import SignUpForm from "./jsx/SignUpForm";
import Login from "./jsx/Login";
import "./styling/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./config/AuthComponent.jsx";

import HomePage from "./jsx/homepage2.jsx";
import ReportFoundItem from "./jsx/ReportFoundItem.jsx";
import PrivateRoute from "./config/PrivateRoute.jsx";
import PublicRoute from "./config/PublicRoute.jsx";
import AdminPage from "./admin/mainpage.jsx";
import ReportLostItem from "./jsx/ReportLostItem.jsx";
import Editreports from "./jsx/editreports.jsx";
function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignUpForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/report-lost-item/*" element={<ReportLostItem />} />
            <Route path="/report-found-item/*" element={<ReportFoundItem />} />
            <Route path="/edit-reported-item/*" element={<Editreports />} />
            <Route path="/adminpage/*" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
