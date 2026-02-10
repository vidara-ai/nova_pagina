
import React from 'react';
import { StatCardProps } from '../types';
import { Icons } from '../constants';

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500 group ${
        onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-2xl transition-colors duration-500">
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest ${
          isPositive 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
            : 'bg-rose-50 text-rose-600 border border-rose-100'
        }`}>
          {isPositive ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
          {change}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{title}</h3>
        <p className="text-3xl font-black text-slate-950 uppercase tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
