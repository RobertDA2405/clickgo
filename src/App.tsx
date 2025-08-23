// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Cuenta from './pages/Cuenta';
import Wishlist from './pages/Wishlist';
import Faq from './pages/Faq';
import Soporte from './pages/Soporte';
import Devoluciones from './pages/Devoluciones';
const Admin = React.lazy(() => import('./pages/Admin'));
import RequireAdmin from './components/RequireAdmin';
import Pedidos from './pages/Pedidos';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import React, { Suspense } from 'react';
const Toaster = React.lazy(() => import('react-hot-toast').then(mod => ({ default: mod.Toaster })));

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white text-gray-900"> 
  <Suspense fallback={null}>
    <Toaster position="top-right" />
  </Suspense>
        <Navbar /> {/* Cambio: Navbar fija */}
  <main className="flex-grow main-with-navbar p-6 max-w-7xl mx-auto"> {/* Ajuste para navbar fija */}
          {/* Welcome heading moved to the Home page to avoid repeating on every route */}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/soporte" element={<Soporte />} />
            <Route path="/devoluciones" element={<Devoluciones />} />
            <Route path="/admin" element={<RequireAdmin><React.Suspense fallback={null}><Admin/></React.Suspense></RequireAdmin>} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;