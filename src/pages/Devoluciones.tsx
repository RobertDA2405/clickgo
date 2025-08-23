import { useEffect } from 'react';

const Devoluciones = () => {
  useEffect(() => {
    document.title = 'Devoluciones — Click&Go';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Política de devoluciones de Click&Go: condiciones, proceso y costos.';
  }, []);

  return (
  <div className="container-max content-pad">
    <div className="prose max-w-none">
    <h1>Política de Devoluciones</h1>
    <p>En Click&Go queremos que quedes satisfecho con tu compra. Si no es así, ofrecemos un proceso de devolución fácil y transparente.</p>

    <h2>Condiciones para devolver un producto</h2>
    <ul>
      <li>El producto debe estar en su empaque original y sin señales de uso.</li>
      <li>Tienes 7 días naturales a partir de la recepción para solicitar la devolución.</li>
      <li>Presentar comprobante de compra (factura o ticket digital).</li>
    </ul>

    <h2>Casos aplicables</h2>
    <p>Producto defectuoso de fábrica, producto incorrecto enviado por error, daños durante el transporte.</p>

    <h2>Casos no aplicables</h2>
    <p>Productos en liquidación/ofertas especiales, daños por mal uso del cliente, productos manipulados o alterados.</p>

    <h2>Proceso de devolución</h2>
    <p>Contáctanos a <a href="mailto:soporte@clickgo.digital">soporte@clickgo.digital</a> con el asunto “Solicitud de devolución”. Adjunta fotos del producto y la factura. Nuestro equipo revisará la solicitud y te indicará el siguiente paso: cambio o reembolso.</p>

    <h2>Costos de devolución</h2>
    <p>Si el error es nuestro, asumimos todos los costos de envío. Si el cliente solicita devolución sin falla del producto, se deducirán costos logísticos.</p>
    </div>
  </div>
  );
};

export default Devoluciones;
