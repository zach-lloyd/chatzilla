import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/GreenButton.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./routes";
import { MessengerProvider } from './components/MessengerContext';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <MessengerProvider>
        <RouterProvider router={router} />
      </MessengerProvider>
  </StrictMode>,
)
