import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // ⏳ TUNGGU SESSION SELESAI
  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center", opacity: 0.7 }}>
        Mengecek sesi...
      </div>
    );
  }

  // ❌ BELUM LOGIN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ SUDAH LOGIN
  return children;
};

export default ProtectedRoute;
