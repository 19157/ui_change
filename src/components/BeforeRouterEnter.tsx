// import { useEffect } from "react";
import { useRoutes, useLocation, useNavigate } from "react-router-dom";
import router from "@/router";
// import { useSelector } from 'react-redux';

export const BeforeRouterEnter = () => {
  const outlet = useRoutes(router);
  // const { token } = useSelector((state: any) => state.user);
  // const location = useLocation();
  // if (location.pathname === "/" && token) {
  //   return <ToRedirect path="/" />;
  // }
  // if (location.pathname !== "/" && !token) {
  //   return <ToRedirect path="/" />;
  // }
  return outlet;
};

// const ToRedirect = (props: { path: string }) => {
//   const navigate = useNavigate();
//   useEffect(() => {
//     navigate(props.path);
//   }, []);
//   return <></>;
// };
