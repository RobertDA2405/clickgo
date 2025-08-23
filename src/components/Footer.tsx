// src/components/Footer.tsx
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer mt-10"> 
    <div className="container-max grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
      <div>
        <h4 className="font-bold text-white mb-2">Click&Go</h4>
        <p className="text-gray-200">Tu tienda online — envíos rápidos y atención dedicada.</p>
      </div>

      <div>
        <h4 className="font-bold text-white mb-2">Enlaces</h4>
        <ul className="space-y-1 text-gray-200">
          <li><Link to="/faq" className="underline">Preguntas frecuentes (FAQ)</Link></li>
          <li><Link to="/soporte" className="underline">Soporte</Link></li>
          <li><Link to="/devoluciones" className="underline">Política de Devoluciones</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-white mb-2">Contacto</h4>
        <div className="text-gray-200 space-y-1">
          <p className="flex items-center gap-2">
            <span aria-hidden className="footer-icon inline-flex w-4 h-4">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" aria-hidden>
                <path d="M3 8.5v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 8.5l-9 6-9-6" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Correo: <a href="mailto:soporte@clickgo.digital" className="underline ml-1">soporte@clickgo.digital</a>
          </p>

          <p className="flex items-center gap-2">
            <span aria-hidden className="footer-icon inline-flex w-4 h-4">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12 1.05.38 2.08.78 3.04a2 2 0 0 1-.45 2.11L9.91 11.09a16 16 0 0 0 6 6l1.22-1.22a2 2 0 0 1 2.11-.45c.96.4 1.99.66 3.04.78A2 2 0 0 1 22 16.92z" stroke="#F8FAFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Teléfono/WhatsApp: <a href="tel:+50558651540" aria-label="Llamar a +505 5865 1540" className="underline ml-1"><strong>+505 5865-1540</strong></a>
          </p>

          <p>Horario: Lunes a sábado, 8:00 a.m. — 6:00 p.m.</p>
        </div>
      </div>
    </div>

    <div className="container-max text-center mt-6 text-sm text-gray-400">
      © 2025 ClickGo. Todos los derechos reservados.
    </div>
  </footer>
);

export default Footer;