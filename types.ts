
export interface ImovelFoto {
  id?: string;
  imovel_id?: string;
  url: string;
  ordem: number;
  is_capa: boolean;
}

export interface Imovel {
  id: string;
  referencia?: string;
  codigo_imovel: string;
  status_imovel: 'Disponível' | 'Reservado' | 'Vendido' | 'Suspenso';
  finalidade: 'venda' | 'locacao' | 'venda_locacao';
  titulo: string;
  slug: string;
  tipo_imovel: string;
  valor_venda: number | null;
  valor_locacao: number | null;
  area_m2: number;
  dormitorios: number;
  suites: number;
  banheiros: number;
  vagas_garagem: number;
  bairro: string;
  cidade: string;
  uf: string;
  descricao: string;
  destaque: boolean;
  ativo: boolean;
  imoveis_fotos?: ImovelFoto[];
}

export interface Caracteristica {
  id: string;
  nome: string;
}

export interface Comodidade {
  id: string;
  nome: string;
}

export interface NegociacaoOpcao {
  id: string;
  nome: string;
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
