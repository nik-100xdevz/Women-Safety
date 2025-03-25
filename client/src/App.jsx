import { Routes,Route } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signin from "./pages/Signin";
import Layout from "./components/Layout";

function App() {
  return (
    <>
      <Routes >
        
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>} />
          <Route path="about-us" element={<About/>} />
          <Route path="contact-us" element={<Contact/>} />
          <Route path="sign-in" element={<Signin/>} />
        </Route>
    </Routes>
    </>
        
  );
}

export default App;
