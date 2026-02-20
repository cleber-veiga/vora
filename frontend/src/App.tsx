import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { DashboardLayout } from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SelectOrganization from './pages/SelectOrganization';
import Agents from './pages/workspace/Agents';
import Skills from './pages/workspace/Skills';
import CreateSkill from './pages/workspace/CreateSkill';
import CRMs from './pages/workspace/CRMs';
import Users from './pages/workspace/Users';
import Settings from './pages/workspace/Settings';
import OrganizationSettings from './pages/organization/Settings';
import Dashboard from './pages/workspace/Dashboard';
import Kanbans from './pages/workspace/Kanbans';
import KanbanBoard from './pages/workspace/KanbanBoard';
import CreateKanban from './pages/workspace/CreateKanban';
import { clearSession, isTokenValid } from './lib/auth';

// Replace with your actual Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const valid = isTokenValid(token);
  if (!valid && token) clearSession();
  return valid ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const valid = isTokenValid(token);
  if (!valid && token) clearSession();
  return valid ? <Navigate to="/workspace/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <OrganizationProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              
              {/* Seleção de Organização */}
              <Route
                path="/select-organization"
                element={
                  <PrivateRoute>
                    <SelectOrganization />
                  </PrivateRoute>
                }
              />

              {/* Rotas do Workspace (com Layout) */}
              <Route
                path="/workspace/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/agents"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Agents />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/skills"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Skills />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/skills/create"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <CreateSkill />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/crms"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <CRMs />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/users"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Users />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/settings"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/kanban"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <Kanbans />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/kanban/new"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <CreateKanban />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/workspace/kanban/:kanbanId"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <KanbanBoard />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/organization/settings"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <OrganizationSettings />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Redirecionamentos */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </OrganizationProvider>
    </GoogleOAuthProvider>
  )
}

export default App
