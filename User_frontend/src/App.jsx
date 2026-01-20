import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";
import Home from "./pages/Home";
import Products from "./pages/Products";
import RequireAuth from "./auth/RequireAuth";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="min-h-[calc(100vh-theme(spacing.20))]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
         
          {/* Protected Routes */}
          <Route path="/cart" element={<RequireAuth><Cart /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;