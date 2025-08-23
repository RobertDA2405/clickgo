import { useEffect } from 'react';

const Soporte = () => {
  useEffect(() => {
    document.title = 'Soporte — Click&Go';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Contacto y soporte de Click&Go: correo, WhatsApp y horarios de atención.';
  }, []);

  return (
  <div className="container-max content-pad">
    <div className="prose max-w-none">
    <h1>Soporte</h1>
    <p>En Click&Go estamos para ayudarte. Si tienes dudas sobre tu pedido, problemas con el pago, o necesitas asistencia técnica, puedes contactarnos a través de los siguientes canales:</p>
    <ul>
      <li>Correo electrónico: <a href="mailto:soporte@clickgo.digital">soporte@clickgo.digital</a></li>
      <li>Teléfono/WhatsApp: <strong>+505 5865-1540</strong></li>
      <li>Horario de atención: Lunes a sábado, de 8:00 a.m. a 6:00 p.m.</li>
      <li>Chat en vivo: Disponible en nuestra tienda online</li>
    </ul>

    <h2>¿Cómo gestionamos tu solicitud?</h2>
    <p>Respuesta inicial en menos de 12 horas hábiles. Resolución promedio: 24 a 48 horas.</p>
    </div>
  </div>
    );
  };

  export default Soporte;
