import React from 'react';

export const LISTA_CARACTERISTICAS_IMOVEL = [
  "Ar condicionado", "Área de serviço", "Armário na cozinha", "Armário no quarto",
  "Armários projetados", "Box no banheiro", "Caixa d’água", "Cisterna",
  "Dependência de empregada", "Quarto de empregada", "WC serviço", "Sala de estar",
  "Sala de jantar", "Sala de visita", "Varanda", "Varanda na sala", "Tela na varanda",
  "Nascente", "Rua asfaltada", "Piscina privativa", "Churrasqueira", "Jardim",
  "Quintal", "Escritório / Home office", "Closet", "Lavabo", "Pé-direito alto",
  "Energia solar", "Mobiliado", "Parcialmente Mobiliado"
];

export const LISTA_CARACTERISTICAS_CONDOMINIO = [
  "Acessível para deficientes", "Elevador", "Portaria 24h", "Guarita",
  "Portão eletrônico", "Gerador", "Bicicletário", "Brinquedoteca",
  "Playground", "Espaço gourmet", "Salão de festas", "Piscina (condomínio)",
  "Quadra poliesportiva (condomínio)", "Campo de futebol (condomínio)",
  "Condomínio fechado", "Rua asfaltada (condomínio)", "Poço artesiano",
  "Academia", "Coworking", "Mercado interno", "Pet place"
];

export const LISTA_PAGAMENTO = [
  "Financiamento", "Uso de FGTS", "Carta de crédito", "Aceita permuta"
];

export const LISTA_GARANTIAS = [
  "Fiador", "Depósito caução"
];

export const THEMES = [
  { id: "indigo-premium", name: "Indigo Premium", colors: { primary: "#4F46E5", secondary: "#6366F1", background: "#F8FAFC", surface: "#FFFFFF", text: "#0F172A", muted: "#64748B" } },
  { id: "azul-executivo", name: "Azul Executivo", colors: { primary: "#2563EB", secondary: "#3B82F6", background: "#F9FAFB", surface: "#FFFFFF", text: "#111827", muted: "#6B7280" } },
  { id: "verde-confianca", name: "Verde Confiança", colors: { primary: "#16A34A", secondary: "#22C55E", background: "#F8FAF9", surface: "#FFFFFF", text: "#052E16", muted: "#6B7280" } },
  { id: "preto-ouro", name: "Preto & Ouro", colors: { primary: "#D4AF37", secondary: "#F5D76E", background: "#0B0B0B", surface: "#111111", text: "#F9FAFB", muted: "#9CA3AF" } },
  { id: "grafite-moderno", name: "Grafite Moderno", colors: { primary: "#334155", secondary: "#64748B", background: "#F8FAFC", surface: "#FFFFFF", text: "#020617", muted: "#94A3B8" } },
  { id: "rose-luxury", name: "Rose Luxury", colors: { primary: "#E11D48", secondary: "#F43F5E", background: "#FFF1F2", surface: "#FFFFFF", text: "#4C0519", muted: "#9F1239" } },
  { id: "amber-classic", name: "Amber Classic", colors: { primary: "#D97706", secondary: "#F59E0B", background: "#FFFBEB", surface: "#FFFFFF", text: "#451A03", muted: "#92400E" } },
  { id: "emerald-nature", name: "Emerald Nature", colors: { primary: "#059669", secondary: "#10B981", background: "#ECFDF5", surface: "#FFFFFF", text: "#064E3B", muted: "#065F46" } },
  { id: "slate-modern", name: "Slate Modern", colors: { primary: "#475569", secondary: "#64748B", background: "#F1F5F9", surface: "#FFFFFF", text: "#0F172A", muted: "#475569" } },
  { id: "crimson-power", name: "Crimson Power", colors: { primary: "#991B1B", secondary: "#B91C1C", background: "#FEF2F2", surface: "#FFFFFF", text: "#450A0A", muted: "#7F1D1D" } },
  { id: "ocean-deep", name: "Ocean Deep", colors: { primary: "#0C4A6E", secondary: "#075985", background: "#F0F9FF", surface: "#FFFFFF", text: "#082F49", muted: "#0369A1" } },
  { id: "forest-deep", name: "Forest Deep", colors: { primary: "#064E3B", secondary: "#065F46", background: "#F0FDF4", surface: "#FFFFFF", text: "#022C22", muted: "#14532D" } },
  { id: "sunset-vibe", name: "Sunset Vibe", colors: { primary: "#EA580C", secondary: "#F97316", background: "#FFF7ED", surface: "#FFFFFF", text: "#431407", muted: "#9A3412" } },
  { id: "midnight-dark", name: "Midnight Dark", colors: { primary: "#1E1B4B", secondary: "#312E81", background: "#0F172A", surface: "#1E293B", text: "#F8FAFC", muted: "#94A3B8" } },
  { id: "concrete-jungle", name: "Concrete Jungle", colors: { primary: "#1F2937", secondary: "#374151", background: "#F3F4F6", surface: "#FFFFFF", text: "#111827", muted: "#4B5563" } },
  { id: "royal-elegance", name: "Royal Elegance", colors: { primary: "#581C87", secondary: "#7E22CE", background: "#FAF5FF", surface: "#FFFFFF", text: "#2E1065", muted: "#6B21A8" } },
  { id: "terracotta-warm", name: "Terracotta Warm", colors: { primary: "#9A3412", secondary: "#C2410C", background: "#FFF7ED", surface: "#FFFFFF", text: "#431407", muted: "#7C2D12" } },
  { id: "sky-high", name: "Sky High", colors: { primary: "#0284C7", secondary: "#0EA5E9", background: "#F0F9FF", surface: "#FFFFFF", text: "#082F49", muted: "#0369A1" } },
  { id: "lavender-dream", name: "Lavender Dream", colors: { primary: "#7C3AED", secondary: "#8B5CF6", background: "#F5F3FF", surface: "#FFFFFF", text: "#2E1065", muted: "#6D28D9" } },
  { id: "charcoal-pro", name: "Charcoal Pro", colors: { primary: "#111827", secondary: "#1F2937", background: "#111827", surface: "#1F2937", text: "#F9FAFB", muted: "#9CA3AF" } },
  { id: "mint-freshness", name: "Mint Freshness", colors: { primary: "#0D9488", secondary: "#14B8A6", background: "#F0FDFA", surface: "#FFFFFF", text: "#042F2E", muted: "#0F766E" } },
  { id: "sand-dune", name: "Sand Dune", colors: { primary: "#A8A29E", secondary: "#D6D3D1", background: "#FAFAF9", surface: "#FFFFFF", text: "#1C1917", muted: "#57534E" } },
  { id: "bordeaux-class", name: "Bordeaux Class", colors: { primary: "#7F1D1D", secondary: "#991B1B", background: "#FFF1F2", surface: "#FFFFFF", text: "#450A0A", muted: "#991B1B" } },
  { id: "teal-professional", name: "Teal Professional", colors: { primary: "#0F766E", secondary: "#115E59", background: "#F0FDFA", surface: "#FFFFFF", text: "#042F2E", muted: "#134E4A" } },
  { id: "coffee-rich", name: "Coffee Rich", colors: { primary: "#78350F", secondary: "#92400E", background: "#FFFBEB", surface: "#FFFFFF", text: "#451A03", muted: "#78350F" } },
  { id: "marble-clean", name: "Marble Clean", colors: { primary: "#E5E7EB", secondary: "#F3F4F6", background: "#FDFDFD", surface: "#FFFFFF", text: "#111827", muted: "#6B7280" } },
  { id: "cyber-glow", name: "Cyber Glow", colors: { primary: "#06B6D4", secondary: "#22D3EE", background: "#083344", surface: "#0E7490", text: "#ECFEFF", muted: "#22D3EE" } },
  { id: "olive-branch", name: "Olive Branch", colors: { primary: "#65A30D", secondary: "#84CC16", background: "#F7FEE7", surface: "#FFFFFF", text: "#1A2E05", muted: "#4D7C0F" } },
];

/**
 * Icons object containing SVG components for consistent usage across the app.
 * Resolves module export errors in Sidebar, StatCard, and page components.
 */
export const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ArrowUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  ArrowDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
};
