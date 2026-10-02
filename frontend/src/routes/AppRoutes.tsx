import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { ElectionsPage } from '../pages/public/ElectionsPage';
import { ElectionDetailPage } from '../pages/public/ElectionDetailPage';
import { ResultsPage } from '../pages/public/ResultsPage';
import { ReceiptVerificationPage } from '../pages/public/ReceiptVerificationPage';
import { SecurityPage } from '../pages/public/SecurityPage';
import { SourcesPage } from '../pages/public/SourcesPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Voter Pages
import { VoterDashboard } from '../pages/voter/VoterDashboard';
import { VotingPage } from '../pages/voter/VotingPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ElectionManagementPage } from '../pages/admin/ElectionManagementPage';
import { ElectionWizardPage } from '../pages/admin/ElectionWizardPage';
import { VoterManagementPage } from '../pages/admin/VoterManagementPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Discovery Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/elections" element={<ElectionsPage />} />
      <Route path="/elections/:idOrSlug" element={<ElectionDetailPage />} />
      <Route path="/election/2026" element={<ElectionDetailPage />} />
      <Route path="/election/2026/candidates" element={<ElectionDetailPage />} />
      <Route path="/election/2026/parties" element={<ElectionDetailPage />} />
      <Route path="/election/2026/constituencies" element={<ElectionDetailPage />} />
      <Route path="/election/2026/results" element={<ResultsPage />} />
      <Route path="/elections/:idOrSlug/results" element={<ResultsPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/sources" element={<SourcesPage />} />
      <Route path="/verify" element={<ReceiptVerificationPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Voter Routes */}
      <Route
        path="/voter/dashboard"
        element={
          <ProtectedRoute>
            <VoterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vote/:electionId"
        element={
          <ProtectedRoute allowedRoles={['VOTER', 'ADMIN', 'ELECTION_MANAGER']}>
            <VotingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin & Election Manager Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'ELECTION_MANAGER']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/elections"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'ELECTION_MANAGER']}>
            <ElectionManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/elections/new"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'ELECTION_MANAGER']}>
            <ElectionWizardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <VoterManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
