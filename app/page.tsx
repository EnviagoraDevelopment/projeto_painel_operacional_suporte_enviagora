
import { getClickUpTickets } from "./actions/clickup";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Target,
  Users,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { VisualAnalytics } from "./components/VisualAnalytics";

export default async function DashboardPage() {
  const tickets = await getClickUpTickets();

  // Total Open
  const openTickets = tickets.filter(t => t.status.toLowerCase() !== 'concluído' && t.ticketStatus?.toLowerCase() !== 'finalizado');

  // Critical Tickets (Urgent priority or delayed)
  const criticalTickets = openTickets.filter(t => {
    const createdDate = new Date(parseInt(t.dateCreated));
    const isDelayed = (Date.now() - createdDate.getTime()) > 24 * 60 * 60 * 1000;
    return t.priority === 'urgent' || t.priority === 'high' || isDelayed;
  }).sort((a, b) => {
    // Sort by priority (urgent first) then by date
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
    return parseInt(b.dateCreated) - parseInt(a.dateCreated);
  });

  const delayedTicketsCount = openTickets.filter(t => {
    const createdDate = new Date(parseInt(t.dateCreated));
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return createdDate < yesterday;
  }).length;

  const urgentTicketsCount = openTickets.filter(t => t.priority === 'urgent').length;

  // Chart Data Preparation
  const statusGroups = openTickets.reduce((acc: any, t) => {
    const key = t.ticketStatus || "A Definir";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusGroups).map(([name, value]) => ({ name, value: value as number }));

  const clientGroups = openTickets.reduce((acc: any, t) => {
    const key = t.client || "Outros";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const clientData = Object.entries(clientGroups)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);

  const priorityGroups = openTickets.reduce((acc: any, t) => {
    const key = t.priority || "none";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const priorityData = ["urgent", "high", "normal", "low", "none"].map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: priorityGroups[p] || 0
  }));

  return (
    <div className="min-h-screen bg-[#050507] text-white p-8 lg:p-12 font-sans tracking-tight overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto flex flex-col gap-10">

        {/* TV Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-purple-400 font-bold uppercase tracking-[0.2em] text-sm">
              <Activity size={20} className="animate-pulse" />
              <span>Painel de Controle Enviagora</span>
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent leading-none">
              SUPORTE OPERACIONAL
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-4xl font-mono font-bold text-white tracking-widest">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-zinc-500 uppercase tracking-widest text-xs font-bold">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
            </div>
            <div className="h-16 w-[1px] bg-white/10 mx-2" />
            <div className={cn(
              "px-6 py-3 rounded-full flex items-center gap-3 border transition-all duration-500",
              urgentTicketsCount > 0 ? "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            )}>
              <ShieldAlert size={24} />
              <span className="text-xl font-black uppercase tracking-tighter">
                {urgentTicketsCount > 0 ? "Alerta de Crise" : "Sistema Estável"}
              </span>
            </div>
          </div>
        </header>

        {/* Global Summary Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          <SummaryCard
            label="Total Abertos"
            value={openTickets.length}
            icon={<MessageSquare size={40} />}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <SummaryCard
            label="Críticos / Urgentes"
            value={urgentTicketsCount}
            icon={<AlertCircle size={40} />}
            color="text-red-500"
            bgColor="bg-red-500/10"
            alert={urgentTicketsCount > 0}
          />
          <SummaryCard
            label="Atrasados > 24h"
            value={delayedTicketsCount}
            icon={<Clock size={40} />}
            color="text-orange-500"
            bgColor="bg-orange-500/10"
            alert={delayedTicketsCount > 1}
          />
          <SummaryCard
            label="Clientes Ativos"
            value={clientData.length}
            icon={<Users size={40} />}
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </div>

        {/* Main TV Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">

          {/* Feed Column - Critical Focus */}
          <div className="xl:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                <Target size={32} className="text-red-500" />
                FILA DE ATENDIMENTO CRÍTICA
              </h2>
              <span className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-zinc-400 font-mono text-sm">
                Mostrando {criticalTickets.length} prioridades
              </span>
            </div>

            <div className="grid gap-6">
              {criticalTickets.length === 0 ? (
                <div className="h-[600px] flex flex-col items-center justify-center bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
                  <CheckCircle2 size={80} className="text-emerald-500 transition-all mb-6" />
                  <p className="text-2xl text-zinc-500 font-bold uppercase tracking-widest">Nenhuma ocorrência crítica</p>
                </div>
              ) : (
                criticalTickets.slice(0, 8).map((ticket) => {
                  const createdDate = new Date(parseInt(ticket.dateCreated));
                  const isDelayed = (Date.now() - createdDate.getTime()) > 24 * 60 * 60 * 1000;
                  const isUrgent = ticket.priority === 'urgent';

                  return (
                    <div
                      key={ticket.id}
                      className={cn(
                        "relative overflow-hidden bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.01] hover:bg-zinc-900/60",
                        isUrgent && "border-red-500/30 ring-1 ring-red-500/20"
                      )}
                    >
                      <div className="flex items-center gap-8">
                        {/* High Vis Priority Indicator */}
                        <div className={cn(
                          "flex flex-col items-center justify-center w-24 h-24 rounded-3xl shrink-0",
                          isUrgent ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400"
                        )}>
                          <span className="text-[10px] font-black uppercase tracking-tighter mb-1">Prioridade</span>
                          <span className="text-xl font-black uppercase leading-none">{ticket.priority}</span>
                        </div>

                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-black truncate max-w-[800px] group-hover:text-purple-400 transition-colors">
                              {ticket.name}
                            </h3>
                            {isDelayed && (
                              <span className="px-4 py-1.5 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-sm font-black rounded-full uppercase tracking-tighter animate-pulse">
                                +24H ATRASO
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl">
                              <Users size={20} className="text-purple-400" />
                              <span className="text-xl font-bold text-zinc-200">{ticket.client}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: ticket.statusColor || '#555' }} />
                              <span className="text-xl font-bold text-zinc-400 lowercase">{ticket.ticketStatus}</span>
                            </div>
                            <div className="text-lg text-zinc-500 font-mono">
                              Aberto {formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR })}
                            </div>
                          </div>
                        </div>

                        <a
                          href={ticket.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-20 h-20 flex items-center justify-center bg-white/5 hover:bg-purple-500 text-white rounded-3xl transition-all duration-500"
                        >
                          <ExternalLink size={32} />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Analytics Column */}
          <div className="xl:col-span-4 space-y-10">
            <div className="flex items-center gap-4">
              <Activity size={32} className="text-blue-500" />
              <h2 className="text-3xl font-black tracking-tighter">ANÁLISE DE SAÚDE</h2>
            </div>

            <VisualAnalytics
              statusData={statusData}
              clientData={clientData}
              priorityData={priorityData}
            />

            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-8 rounded-[3rem] border border-white/10 text-center space-y-4">
              <h4 className="text-xl font-black uppercase tracking-widest text-white/60">Taxa de Resolução</h4>
              <div className="text-7xl font-black">
                {Math.round(((tickets.length - openTickets.length) / tickets.length) * 100)}%
              </div>
              <div className="text-zinc-400 font-bold uppercase text-sm tracking-tighter">Média das últimas 24h</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color, bgColor, alert }: any) {
  return (
    <div className={cn(
      "relative overflow-hidden p-8 rounded-[3rem] border border-white/5 backdrop-blur-2xl transition-all duration-500",
      alert ? "bg-red-500/5 animate-pulse border-red-500/20" : "bg-white/5 hover:border-white/10"
    )}>
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <p className="text-zinc-500 uppercase tracking-[0.2em] font-black text-sm">{label}</p>
          <p className={cn("text-7xl font-black tracking-tighter", color)}>{value}</p>
        </div>
        <div className={cn("p-6 rounded-[2.5rem]", bgColor, color)}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all w-full" />
    </div>
  );
}
