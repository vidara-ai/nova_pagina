
export interface ImovelFoto {
  url: string;
}

export interface Imovel {
  id: string;
  titulo: string;
  slug: string;
  valor_venda: number | null;
  valor_locacao: number | null;
  dormitorios: number;
  suites: number;
  banheiros: number;
  vagas_garagem: number;
  area_m2: number;
  bairro: string;
  cidade: string;
  uf: string;
  destaque: boolean;
  imoveis_fotos: ImovelFoto[];
}

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
    email: string;
  };
  action: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  amount: string;
}

export interface ChartData {
  name: string;
  revenue: number;
  orders: number;
}
