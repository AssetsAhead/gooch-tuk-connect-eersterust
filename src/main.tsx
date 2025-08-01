import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AnalyticsProvider } from './components/AnalyticsTracker.tsx';

createRoot(document.getElementById("root")!).render(
  <AnalyticsProvider>
    <App />
  </AnalyticsProvider>
);
