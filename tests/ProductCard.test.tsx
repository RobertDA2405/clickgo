import { render, screen } from '@testing-library/react';
import ProductCard from '../src/components/ProductCard';
import { BrowserRouter } from 'react-router-dom';

const product = {
  id: 'p1',
  nombre: 'Test Product',
  precio: 9.99,
  imagenes: [],
  descripcion: 'Desc',
};

test('renders ProductCard and add to cart button', async () => {
  render(
    <BrowserRouter>
      <ProductCard product={product} />
    </BrowserRouter>
  );

  expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  // aria-label includes the product name (e.g. "Añadir Test Product al carrito")
  const btn = screen.getByRole('button', { name: /Añadir.*al carrito/i });
  expect(btn).toBeInTheDocument();
});
