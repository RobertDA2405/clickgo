import { useEffect } from 'react';

const Faq = () => {
  useEffect(() => {
    document.title = 'FAQ — Click&Go';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Preguntas frecuentes sobre compras, envíos, pagos y devoluciones en Click&Go.';
  }, []);

  return (
  <div className="container-max content-pad">
    <div className="prose max-w-none">
      <h1>Preguntas Frecuentes (FAQ)</h1>
    <h2>1. ¿Cómo puedo realizar una compra en Click&Go?</h2>
    <p>Solo debes navegar por nuestro catálogo, seleccionar el producto que deseas y añadirlo al carrito. Luego, sigue los pasos para completar el pago seguro.</p>

    <h2>2. ¿Qué métodos de pago aceptan?</h2>
    <p>Aceptamos tarjetas de crédito, débito, transferencias bancarias y pagos mediante plataformas seguras.</p>

    <h2>3. ¿Hacen envíos a todo el país?</h2>
    <p>Sí, realizamos envíos a todo el territorio nacional. El tiempo de entrega depende de tu ubicación y será mostrado antes de confirmar la compra.</p>

    <h2>4. ¿Cuánto tarda en llegar mi pedido?</h2>
    <p>El tiempo de entrega oscila entre 24 a 72 horas en zonas urbanas y hasta 5 días hábiles en zonas rurales.</p>

    <h2>5. ¿Puedo modificar o cancelar mi pedido?</h2>
    <p>Puedes modificar o cancelar tu pedido antes de que sea despachado. Para hacerlo, contáctanos de inmediato a nuestro centro de soporte.</p>

    <h2>6. ¿Qué pasa si el producto llega dañado o defectuoso?</h2>
    <p>Si el producto presenta defectos de fábrica o daños durante el transporte, podrás solicitar cambio o reembolso siguiendo nuestra Política de devoluciones.</p>

    <h2>7. ¿Ofrecen garantía en los productos?</h2>
    <p>Sí, todos nuestros productos cuentan con garantía legal. La duración y condiciones varían según la categoría del producto.</p>
    </div>
  </div>
    );
  };

  export default Faq;
