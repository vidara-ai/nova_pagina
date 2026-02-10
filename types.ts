
export interface ImovelFoto {
  id?: string;
  imovel_id: string;
  path: string;
  ordem: number;
  is_capa: boolean;
}

export interface Imovel {
  id: string;
  referencia?: string;
  codigo_imovel: string;
  status_imovel: 'Disponível' | 'Indisponível' | 'Vendido' | 'Alugado' | 'Suspenso';
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
  caracteristicas_imovel: string[];
  caracteristicas_condominio: string[];
  opcoes_negociacao: string[];
  imoveis_fotos?: ImovelFoto[];
}

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}
