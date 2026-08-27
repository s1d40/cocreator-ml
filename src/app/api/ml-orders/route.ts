import { NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/api-auth';
import { getMlTokenForClient } from '@/lib/user-store';

export interface MLOrderItem {
  item: {
    id: string;
    title: string;
    category_id?: string;
    seller_sku?: string;
  };
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MLOrder {
  id: number | string;
  date_created: string;
  date_closed?: string;
  status: 'paid' | 'pending' | 'cancelled' | 'shipped' | 'delivered';
  status_detail?: string;
  total_amount: number;
  currency_id: string;
  buyer: {
    id: number | string;
    nickname: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  order_items: MLOrderItem[];
  payments?: Array<{
    id: number | string;
    transaction_amount: number;
    currency_id: string;
    status: string;
    payment_method_id?: string;
  }>;
  shipping?: {
    id?: number | string;
    status?: string;
    shipping_mode?: string;
  };
}

// Generate realistic mock sales data for Mercado Libre orders dashboard when running without live API access
function getMockOrders(): MLOrder[] {
  const now = new Date();
  const mockOrders: MLOrder[] = [];
  const statuses: ('paid' | 'pending' | 'cancelled' | 'shipped' | 'delivered')[] = [
    'paid', 'paid', 'paid', 'delivered', 'delivered', 'shipped', 'pending', 'cancelled'
  ];

  const products = [
    { id: 'MLB1001', title: 'Auriculares Inalámbricos Bluetooth High Fidelity', price: 45.99, cat: 'Audio' },
    { id: 'MLB1002', title: 'Smartwatch Fitness Tracker Monitor Cardíaco', price: 89.50, cat: 'Wearables' },
    { id: 'MLB1003', title: 'Teclado Mecánico RGB Switch Blue Wireless', price: 65.00, cat: 'Periféricos' },
    { id: 'MLB1004', title: 'Mouse Gamer Ergonómico 16000 DPI', price: 29.99, cat: 'Periféricos' },
    { id: 'MLB1005', title: 'Soporte de Aluminio para Laptop Regulable', price: 24.50, cat: 'Accesorios' },
    { id: 'MLB1006', title: 'Cargador Rápido GaN 65W USB-C Multipuerto', price: 34.00, cat: 'Accesorios' },
    { id: 'MLB1007', title: 'Lámpara LED Escritorio con Carga Inalámbrica', price: 39.90, cat: 'Hogar' },
    { id: 'MLB1008', title: 'Mochila Impermeable para Laptop 15.6"', price: 49.99, cat: 'Accesorios' },
  ];

  const buyers = [
    { id: 201, nickname: 'CARLOS_TECH', first_name: 'Carlos', last_name: 'Mendoza' },
    { id: 202, nickname: 'ANA_SILVA', first_name: 'Ana', last_name: 'Silva' },
    { id: 203, nickname: 'DEV_STORE', first_name: 'Lucas', last_name: 'Pereira' },
    { id: 204, nickname: 'MARIA_G', first_name: 'María', last_name: 'Gómez' },
    { id: 205, nickname: 'ROBERTO_BA', first_name: 'Roberto', last_name: 'Alvarez' },
    { id: 206, nickname: 'FERNANDA_R', first_name: 'Fernanda', last_name: 'Rios' },
  ];

  for (let i = 0; i < 45; i++) {
    const dayOffset = Math.floor(i / 1.5);
    const orderDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000 - (i % 5) * 3600 * 1000);
    const product = products[i % products.length];
    const buyer = buyers[i % buyers.length];
    const status = statuses[i % statuses.length];
    const qty = (i % 3) + 1;
    const total = Number((product.price * qty).toFixed(2));

    mockOrders.push({
      id: 2000000000 + i,
      date_created: orderDate.toISOString(),
      date_closed: orderDate.toISOString(),
      status: status,
      status_detail: status === 'cancelled' ? 'buyer_cancelled' : 'accredited',
      total_amount: total,
      currency_id: 'USD',
      buyer: {
        id: buyer.id,
        nickname: buyer.nickname,
        first_name: buyer.first_name,
        last_name: buyer.last_name,
        email: `${buyer.nickname.toLowerCase()}@user.example.com`
      },
      order_items: [
        {
          item: {
            id: product.id,
            title: product.title,
            category_id: product.cat,
            seller_sku: `SKU-${product.id}`
          },
          quantity: qty,
          unit_price: product.price,
          currency_id: 'USD'
        }
      ],
      payments: [
        {
          id: 500000000 + i,
          transaction_amount: total,
          currency_id: 'USD',
          status: status === 'cancelled' ? 'cancelled' : 'approved',
          payment_method_id: i % 2 === 0 ? 'credit_card' : 'pix'
        }
      ],
      shipping: {
        id: 700000000 + i,
        status: status === 'delivered' ? 'delivered' : 'ready_to_ship',
        shipping_mode: 'me2'
      }
    });
  }

  return mockOrders;
}

export async function GET(request: Request) {
  const auth = await verifyApiAuth(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  const clientId = auth.clientId;
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('seller_id') || 'me';

  // Get token associated with authenticated client_id
  const token = getMlTokenForClient(clientId);

  if (token) {
    try {
      const mlRes = await fetch(`https://api.mercadolibre.com/orders/search?seller=${sellerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (mlRes.ok) {
        const mlData = await mlRes.json();
        return NextResponse.json({
          client_id: clientId,
          source: 'live',
          orders: mlData.results || [],
          total: mlData.paging?.total || 0,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch live Mercado Libre orders:', err);
    }
  }

  // Fallback to rich evaluation mock sales data if live API call fails or no token
  const mockData = getMockOrders();
  return NextResponse.json({
    client_id: clientId,
    source: 'mock',
    orders: mockData,
    total: mockData.length,
    message: token
      ? 'Live API request failed; displaying read-only evaluation dataset.'
      : 'No access token provided for client; displaying evaluation demo sales data.',
  });
}
