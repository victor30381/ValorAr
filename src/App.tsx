import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InvestmentProvider } from "./context/InvestmentContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import DashboardView from "./components/Dashboard/DashboardView";
import Login from "./components/Auth/Login";
import AssistantView from "./components/AI/AssistantView";

function App() {
  return (
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
                  <div><h2>Movimientos (Próximamente)</h2></div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <div><h2>Reportes (Próximamente)</h2></div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <div><h2>Perfil (Próximamente)</h2></div>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div><h2>404 - No encontrado</h2></div>} />
        </Routes>
      </InvestmentProvider>
    </AuthProvider>
  );
}

export default App;
