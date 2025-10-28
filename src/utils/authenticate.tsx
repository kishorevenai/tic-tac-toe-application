import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const Authenticate: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("nakamaSession");

    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <Outlet />;
};

export default Authenticate;
