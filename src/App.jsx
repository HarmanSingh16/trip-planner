import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));

export default function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ErrorBoundary><Dashboard /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:tripId/*"
              element={
                <ProtectedRoute>
                  <ErrorBoundary><TripPlanner /></ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
    </ErrorBoundary>
  );
}
