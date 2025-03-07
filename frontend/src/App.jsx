import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { Home } from "./pages/Home";
import NGO from "./pages/NGO";
import Counselor from "./pages/Counselor";
import Maps from "./pages/Maps";
import SafeRoute from "./pages/SafeRoute";
import All from "./pages/All";
import Tips from "./pages/Tips";
import Report from "./pages/Report";
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthenticating } = useAuthStore();
  if (isAuthenticating) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const Prevent = ({ children }) => {
  const { isAuthenticated, isAuthenticating } = useAuthStore();
  if (isAuthenticating) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

Prevent.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Routes>
        <Route
          path="/safeRoute"
          element={
            <SafeRoute />
          }
        />
        <Route
          path="/"
          element={
            <Home />
          }
        />
        <Route
          path="/login"
          element={
            <Prevent>
              <Login />
            </Prevent>
          }
        />
        <Route
          path="/signup"
          element={
            <Prevent>
              <Signup />
            </Prevent>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo"
          element={
         
              <NGO />
            
          }
        />
        <Route
          path="/maps"
          element={
              <Maps />
          }
        />
        <Route
          path="/counsel"
          element={
            
              <Counselor />
           
          }
        />
        <Route
          path="/all"
          element={
          
              <All />
           
          }
        />
        <Route
          path="/tips"
          element={
              <Tips />
          }
        />

        <Route
          path="/report"
          element={
              <Report />
          }
        />
        
        
      </Routes>
    </>
  )
};

export default App;
