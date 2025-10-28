import React, { useEffect, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { MyContext } from "../store/nakamaContext";

const Authenticate: React.FC = () => {
  const navigate = useNavigate();
  const data = useContext(MyContext);

  const token = localStorage.getItem("nakamaSession");

  useEffect(() => {
    if (!token || !data?.user) {
      navigate("/", { replace: true });
    }
  }, [navigate, data, token]);

  return <Outlet />;
};

export default Authenticate;
