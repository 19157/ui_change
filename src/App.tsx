import React from "react";
import { ConfigProvider } from "antd";
// import { RouterProvider } from 'react-router-dom';
import zhCN from "antd/locale/zh_CN";
// import router from './router';
import ErrorBoundary from "@/components/ErrorBoundary";
import { BeforeRouterEnter } from "./components/BeforeRouterEnter";

// App 组件：应用的根组件，设置全局配置和路由
const App: GenieType.FC = React.memo(() => {
  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN}>
        <BeforeRouterEnter />
        {/* <RouterProvider router={router} /> */}
      </ConfigProvider>
    </ErrorBoundary>
  );
});

export default App;
