export interface User {
  uid: string;
  nombre: string;
  email: string;
  rol: 'user' | 'admin';
}

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  categoria: string;
  imagenes: string[];
  activo: boolean;
  creadoEn: Date;
}

export interface Cart {
  items: Array<{
    productId: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }>;
  actualizadoEn: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    nombre: string;
    precioUnit: number;
    cantidad: number;
  }>;
  subtotal: number;
  envio: { tipo: string; costo: number };
  total: number;
  direccionEnvio: string;
  metodoPagoSimulado: string;
  estado: 'pendiente' | 'enviado' | 'entregado';
  creadoEn: Date;
}