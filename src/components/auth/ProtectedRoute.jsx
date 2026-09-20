import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


function ProtectedRoute({ children }) {


  const { user, loading } = useAuth();



  if (loading) {

    return (

      <div className="h-screen flex items-center justify-center">

        <p className="text-slate-500">
          Loading...
        </p>

      </div>

    );

  }



  if (!user || !["admin", "superadmin"].includes(user.profile?.role) ||
      user.profile?.status !== "active") {

    return <Navigate to="/login" replace />;

  }



  return children;

}


export default ProtectedRoute;
