// import React, { StrictMode } from 'react'; // 暂时移除严格模式
import { createRoot } from 'react-dom/client';
import App from './App';
import './global.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
} else {
  console.error('Root element not found');
}
