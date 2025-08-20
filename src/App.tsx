import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Cuenta from './pages/Cuenta';
import Admin from './pages/Admin';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <Navbar />
      <main className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Bienvenido a ClickGo!</h1>
          <p className="text-gray-700">Explora nuestros productos y disfruta tu experiencia.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto" element={<Producto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
