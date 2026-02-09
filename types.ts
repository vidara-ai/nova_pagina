
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
