import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InvestmentProvider } from "./context/InvestmentContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import DashboardView from "./components/Dashboard/DashboardView";
import Login from "./components/Auth/Login";
import AssistantView from "./components/AI/AssistantView";
import MovementsView from "./components/Movements/MovementsView";
import ProfileView from "./components/Profile/ProfileView";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InvestmentProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardView />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AssistantView />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/movements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MovementsView />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfileView />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<div><h2>404 - No encontrado</h2></div>} />
          </Routes>
        </InvestmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
