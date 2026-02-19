
import { getClickUpTickets } from "./actions/clickup";
import { getRecebimentoData } from "./actions/sheets";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Target,
  Users,
  ExternalLink,
  ShieldAlert,
  Activity,
  Truck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VisualAnalytics } from "./components/VisualAnalytics";
import { RecebimentoNaoCadastrado } from "./components/RecebimentoNaoCadastrado";
import { CronogramaInsumos } from "./components/CronogramaInsumos";
import { getLabelErrors } from "./actions/labelErrors";
import { ErroEtiquetas } from "./components/ErroEtiquetas";

interface ClickUpTicket {
  id: string;
  name: string;
  originalName: string;
  status: string;
  ticketStatus?: string;
  dateCreated: string;
  dueDate?: string;
  startDate?: string;
  dateClosed?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low' | 'none' | string;
  client?: string;
  statusColor?: string;
  url: string;
}

export default async function DashboardPage() {
  const [tickets, recebimentoData, labelErrorData] = await Promise.all([
    getClickUpTickets() as Promise<ClickUpTicket[]>,
    getRecebimentoData(),
    getLabelErrors()
  ]);

  // Total Open (Voltamos a incluir tudo para que os gráficos de Clientes e Fila reflitam a operação total)
  const openTickets = tickets.filter((t: ClickUpTicket) => t.status.toLowerCase() !== 'concluído' && t.ticketStatus?.toLowerCase() !== 'finalizado');

  // Critical Tickets (Urgent priority or delayed)
  const criticalTickets = openTickets.filter((t: ClickUpTicket) => {
    const createdDate = new Date(parseInt(t.dateCreated));
    const isDelayed = (Date.now() - createdDate.getTime()) > 24 * 60 * 60 * 1000;
    return t.priority === 'urgent' || t.priority === 'high' || isDelayed;
  }).sort((a: ClickUpTicket, b: ClickUpTicket) => {
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
    return parseInt(b.dateCreated) - parseInt(a.dateCreated);
  });

  const delayedTicketsCount = openTickets.filter((t: ClickUpTicket) => {
    const createdDate = new Date(parseInt(t.dateCreated));
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return createdDate < yesterday;
  }).length;

  const urgentTicketsCount = openTickets.filter((t: ClickUpTicket) => t.priority === 'urgent').length;

  // Chart Data Preparation - Agora usando o Status NATIVO do ClickUp
  const statusGroups = openTickets.reduce((acc: Record<string, number>, t: ClickUpTicket) => {
    const key = t.status || "A Definir";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusGroups).map(([name, value]) => ({ name, value: value as number }));

  const clientGroups = openTickets.reduce((acc: Record<string, number>, t: ClickUpTicket) => {
    const key = t.client || "Outros";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const clientData = Object.entries(clientGroups)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  const priorityGroups = openTickets.reduce((acc: Record<string, number>, t: ClickUpTicket) => {
    const key = t.priority || "none";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const priorityData = ["urgent", "high", "normal", "none"].map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: priorityGroups[p] || 0
  }));

  return (
    <div className="min-h-screen bg-[#050507] text-white p-8 lg:p-12 font-sans tracking-tight overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto flex flex-col gap-12">

        {/* TV Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-purple-400 font-bold uppercase tracking-[0.2em] text-sm">
              <Activity size={20} className="animate-pulse" />
              <span>Painel de Controle Enviagora</span>
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent leading-none">
              SUPORTE OPERACIONAL
            </h1>
          </div>

          <div className="flex items-center gap-10">
            <div className="flex flex-col items-end">
              <span className="text-5xl font-mono font-bold text-white tracking-widest">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-bold">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
            </div>
            <div className="h-16 w-[1px] bg-white/10" />
            <div className={`px-8 py-4 rounded-2xl flex items-center gap-4 border transition-all duration-500 ${urgentTicketsCount > 0 ? "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"}`}>
              <ShieldAlert size={32} />
              <span className="text-2xl font-black uppercase tracking-tighter">
                {urgentTicketsCount > 0 ? "Alerta de Crise" : "Sistema Estável"}
              </span>
            </div>
          </div>
        </header>

        {/* SECTION 1: Top Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8">
          <SummaryCard
            label="Total Tickets Abertos"
            value={openTickets.length}
            icon={<MessageSquare size={40} />}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <SummaryCard
            label="Tickets Críticos / Urgentes"
            value={urgentTicketsCount}
            icon={<AlertCircle size={40} />}
            color="text-red-500"
            bgColor="bg-red-500/10"
            alert={urgentTicketsCount > 0}
          />
          <SummaryCard
            label="Notas não cadastradas WMS"
            value={recebimentoData.length}
            icon={<Truck size={40} />}
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
            alert={recebimentoData.some(item => item.horasPendentes >= 3)}
          />
          <SummaryCard
            label="Tickets Atrasados > 24h"
            value={delayedTicketsCount}
            icon={<Clock size={40} />}
            color="text-orange-500"
            bgColor="bg-orange-500/10"
            alert={delayedTicketsCount > 0}
          />
          <SummaryCard
            label="Erros de Etiqueta (Hoje)"
            value={labelErrorData.totalToday}
            icon={<ShieldAlert size={40} />}
            color="text-red-500"
            bgColor="bg-red-500/10"
            alert={labelErrorData.totalToday > 15}
          />
        </div>



        {/* SECTION 2: Horizontal Health Analytics */}
        <div className="space-y-8 pt-6">
          <div className="flex items-center gap-4 border-t border-white/5 pt-10">
            <Activity size={32} className="text-blue-500" />
            <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Análise de Saúde da <span className="text-zinc-500">Operação</span></h2>
          </div>

          <VisualAnalytics
            statusData={statusData}
            clientData={clientData}
            priorityData={priorityData}
          />
        </div>
        {/* NEW SECTION: Recebimento NFs */}
        <RecebimentoNaoCadastrado initialData={recebimentoData} />

        {/* SECTION: Erros de Etiquetas */}
        <ErroEtiquetas data={labelErrorData} />

        {/* SECTION: Cronograma de Insumos */}
        <CronogramaInsumos tasks={tickets} />

        {/* SECTION 3: Bottom Full-Width Critical Feed */}
        <div className="space-y-8 pt-6">
          <div className="flex items-center justify-between border-t border-white/5 pt-10">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4 uppercase text-white">
              <Target size={32} className="text-red-500" />
              Fila de Atendimento <span className="text-zinc-500">Crítica</span>
            </h2>
            <span className="px-6 py-2 bg-white/5 rounded-2xl border border-white/10 text-zinc-400 font-mono text-lg font-bold">
              {criticalTickets.length} Ocorrências Relevantes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {criticalTickets.length === 0 ? (
              <div className="col-span-full h-[300px] flex flex-col items-center justify-center bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
                <CheckCircle2 size={80} className="text-emerald-500 transition-all mb-6" />
                <p className="text-2xl text-zinc-500 font-bold uppercase tracking-widest">Nenhuma ocorrência crítica no radar</p>
              </div>
            ) : (
              criticalTickets.map((ticket: ClickUpTicket) => {
                const createdDate = new Date(parseInt(ticket.dateCreated || "0"));
                const isDelayed = !isNaN(createdDate.getTime()) && (Date.now() - createdDate.getTime()) > 24 * 60 * 60 * 1000;
                const priority = (ticket.priority || "none").toLowerCase();
                const isUrgent = priority === 'urgent';

                return (
                  <div
                    key={ticket.id}
                    className={`relative overflow-hidden bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.01] hover:bg-zinc-900/60 flex flex-col justify-between h-auto min-h-[160px] ${isUrgent ? "border-red-500/30 ring-1 ring-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.05)]" : ""}`}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl shrink-0 ${isUrgent ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                        <span className="text-[9px] font-black uppercase mb-1">GRAVIDADE</span>
                        <span className="text-lg font-black uppercase leading-none">{priority}</span>
                      </div>

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black truncate group-hover:text-purple-400 transition-colors">
                            {ticket.name || "Sem Nome"}
                          </h3>
                          {isDelayed && (
                            <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-black rounded-full uppercase">
                              OVERDUE
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl">
                            <Users size={16} className="text-purple-400" />
                            <span className="text-lg font-bold text-zinc-200">{ticket.client || "---"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ticket.statusColor || '#555' }} />
                            <span className="text-lg font-bold text-zinc-200 lowercase">{ticket.ticketStatus || "---"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="text-base text-zinc-500 font-mono font-black">
                        {!isNaN(createdDate.getTime()) ? formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR }) : "--"}
                      </div>
                      <a
                        href={ticket.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-purple-500 text-white rounded-xl transition-all"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  alert?: boolean;
}

function SummaryCard({ label, value, icon, color, bgColor, alert }: SummaryCardProps) {
  return (
    <div className={`relative overflow-hidden p-8 rounded-[3rem] border border-white/5 backdrop-blur-2xl transition-all duration-500 ${alert ? "bg-red-500/5 animate-pulse border-red-500/20" : "bg-white/5 hover:border-white/10"}`}>
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <p className="text-zinc-500 uppercase tracking-[0.2em] font-black text-sm">{label}</p>
          <p className={`text-7xl font-black tracking-tighter ${color}`}>{value}</p>
        </div>
        <div className={`p-6 rounded-[2.5rem] ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all w-full" />
    </div>
  );
}
