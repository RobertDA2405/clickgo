// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import NavbarDesktop from './NavbarDesktop';
import NavbarMobile from './NavbarMobile';

export default function Navbar() {
  return (
    <nav className="main-nav bg-white text-gray-900 shadow-lg fixed top-0 left-0 right-0" style={{ height: 'var(--nav-height)', zIndex: 'var(--z-nav)' }}>
      <ClientSwitch />
    </nav>
  );
}

function ClientSwitch() {
  // Start with a reasonable default for SSR. After mount we update to actual width.
  const [isMobile, setIsMobile] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth <= 767 : false));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', onResize);
    // also run once to pick up correct client width
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile ? <NavbarMobile /> : <NavbarDesktop />;
}