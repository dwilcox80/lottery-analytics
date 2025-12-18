// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Analytics from "./pages/Analytics";
import ProfilePage from "./pages/ProfilePage";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />

        {/* Protected routes */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/*/!* Default route *!/*/}
        {/*<Route path="*" element={<Analytics />} />*/}

      </Routes>
    </BrowserRouter>
  );
}