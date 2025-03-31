import React from 'react';
import { WebSocketProvider } from './components/WebSocketProvider';
import AppRoutes from './routes.jsx';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AppRoutes />
        <ToastContainer />
      </div>
    </WebSocketProvider>
  );
}

export default App;
