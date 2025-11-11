import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/layout/index";
import { Loading } from "@/components";

// 使用常量存储路由路径
const ROUTES = {
  LOGIN: "/",
  HOME: "/chat",
  CHATHISTORY: "/chat/:sessionId",
  ONEPAGE: "/onepage",
  NOT_FOUND: "*",
};

// 使用 React.lazy 懒加载组件
const Login = React.lazy(() => import("@/pages/Login").then((module) => {
  return module;
}));
const Home = React.lazy(() => import("@/pages/Home").then((module) => {
  return module;
}));
const ChatHistory = React.lazy(() => import("@/pages/ChatHistory").then((module) => {
  return module;
}));
const OnePage = React.lazy(() => import("@/pages/OnePage").then((module) => {
  return module;
}));
const NotFound = React.lazy(() => import("@/components/NotFound").then((module) => {
  return module;
}));

// 创建路由配置
const router = [
  // 多个页面路由（url会回退，也会随着对话改变url地址）
  {
    path: ROUTES.LOGIN,
    element: (
      <Suspense>
        <Login />
      </Suspense>
    ),
  },
  {
    path: ROUTES.HOME,
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading loading={true} className="h-full" />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CHATHISTORY,
        element: (
          <Suspense>
            <ChatHistory />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: (
      <Suspense>
        <NotFound />
      </Suspense>
    ),
  },

  // 单个页面的路由配置（url不会回退，不会随着对话改变）
  // {
  //   path: ROUTES.LOGIN,
  //   element: (
  //     <Suspense>
  //       <Login />
  //     </Suspense>
  //   ),
  // },
  // {
  //   path: ROUTES.ONEPAGE,
  //   element: (
  //     <Suspense>
  //       <OnePage />
  //     </Suspense>
  //   ),
  // },
  // // 重定向所有未匹配的路由到 404 页面
  // {
  //   path: ROUTES.NOT_FOUND,
  //   element: (
  //     <Suspense>
  //       <NotFound />
  //     </Suspense>
  //   ),
  // }
];

export default router;
