// src/components/Footer.tsx
const Footer = () => (
  <footer className="site-footer mt-10"> 
    <div className="container-max grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h4 className="font-bold text-white mb-2">ClickGo</h4>
        <p className="text-sm">Tu tienda online — envíos rápidos y atención dedicada.</p>
      </div>
      <div>
        <h5 className="font-semibold text-white mb-2">Ayuda</h5>
        <ul className="space-y-1 text-sm">
          <li><a href="#">Preguntas frecuentes</a></li>
          <li><a href="#">Soporte</a></li>
          <li><a href="#">Política de devoluciones</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-semibold text-white mb-2">Síguenos</h5>
        <div className="flex gap-3">
          <a href="#">Twitter</a>
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
        </div>
      </div>
    </div>

    <div className="container-max text-center mt-6 text-sm text-gray-400">
      © 2025 ClickGo. Todos los derechos reservados.
    </div>
  </footer>
);

export default Footer;