import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AddressProvider } from './context/AddressContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider><AuthProvider>
        <CartProvider>
          <OrderProvider>
            <AddressProvider>
              <App />
              <ToastContainer position="top-right" autoClose={3000} />
            </AddressProvider>
          </OrderProvider>
        </CartProvider>
      </AuthProvider></ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)