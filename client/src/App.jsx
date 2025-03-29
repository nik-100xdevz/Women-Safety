import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "./App.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signin from "./pages/Signin";
import Signup from './pages/Signup';
import Community from './pages/Community';
import Resources from './pages/Resources';
import Emergency from './pages/Emergency';
import ReportIncident from './pages/ReportIncident'
import IncidentDetail from './pages/IncidentDetail'
import LiveLocation from './pages/LiveLocation'
import EmergencyAlert from './pages/EmergencyAlert'
import Layout from "./components/Layout";
import MyProfile from './pages/MyProfile';
import MyReports from './pages/MyReports';
import MyComments from './pages/MyComments';
import ChatWithFriends from './pages/ChatWithFriends';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>} />
          <Route path="about" element={<About/>} />
          <Route path="contact" element={<Contact/>} />
          <Route path="/signin" element={<Signin/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/community" element={<Community />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/emergency/alert" element={<EmergencyAlert />} />
          <Route path="/emergency/live-location" element={<LiveLocation />} />
          <Route path="/emergency/report-incident" element={<ReportIncident/>} />
          <Route path="/emergency/report-incident/:id" element={<IncidentDetail/>} />
          <Route path="/emergency/chat" element={<ChatWithFriends/>} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/profile/reports" element={<MyReports />} />
          <Route path="/profile/comments" element={<MyComments />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
