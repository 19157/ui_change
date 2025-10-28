import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/layout/index";
import { Loading } from "@/components";

// 使用常量存储路由路径
const ROUTES = {
  HOME: "/",
  CHATHISTORY: "/chat/:sessionId",
  NOT_FOUND: "*",
};

// 使用 React.lazy 懒加载组件
const Home = React.lazy(() => import("@/pages/Home"));
const ChatHistory = React.lazy(() => import("@/pages/ChatHistory"));
const NotFound = React.lazy(() => import("@/components/NotFound"));

// 创建路由配置
const router = [
  {
    path: ROUTES.HOME,
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          // <Suspense fallback={<Loading loading={true} className="h-full" />}>
          <Suspense>
            <Home />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CHATHISTORY,
        element: (
          // <Suspense fallback={<Loading loading={true} className="h-full" />}>
          <Suspense>
            <ChatHistory />
          </Suspense>
        ),
      },
      {
        path: ROUTES.NOT_FOUND,
        element: (
          // <Suspense fallback={<Loading loading={true} className="h-full" />}>
          <Suspense>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  // 重定向所有未匹配的路由到 404 页面
  {
    path: "*",
    element: <Navigate to={ROUTES.NOT_FOUND} replace />,
  },
];

export default router;
