import './i18n/config';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';                               
import App from './App.tsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ServiceProvider } from './core/di/ServiceContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="29076684294-sjoote056esnibv6de021squum07a2s4.apps.googleusercontent.com">
      {/* 3. Bọc App lại bằng QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <ServiceProvider>
          <App />
        </ServiceProvider>
        
        {/* 4. Gắn thêm cái nút DevTools ở góc màn hình (Chỉ hiển thị lúc code) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
