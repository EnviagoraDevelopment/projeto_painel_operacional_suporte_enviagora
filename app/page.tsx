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

  const openTickets = tickets.filter((t: ClickUpTicket) => t.status.toLowerCase() !== 'concluído' && t.ticketStatus?.toLowerCase() !== 'finalizado');

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
    <div className="min-h-screen bg-[#F4F6F5] text-[#2A2A2E] p-8 lg:p-12 font-sans tracking-tight overflow-x-hidden">
      {/* Background gradients - subtle green tones */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#2ECC71]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#1E8F4A]/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto flex flex-col gap-12">

        {/* TV Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[#1E8F4A] font-bold uppercase tracking-[0.2em] text-sm">
              <Activity size={20} className="animate-pulse" />
              <span>Painel de Controle Enviagora</span>
            </div>
            <h1 className="text-6xl font-black text-[#2A2A2E] leading-none">
              SUPORTE <span className="text-[#2ECC71]">OPERACIONAL</span>
            </h1>
          </div>

        </header>

        {/* SECTION 1: Top Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8">
          <SummaryCard
            label="Total Tickets Abertos"
            value={openTickets.length}
            icon={<MessageSquare size={40} />}
            color="text-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          />
          <SummaryCard
            label="Tickets Críticos / Urgentes"
            value={urgentTicketsCount}
            icon={<AlertCircle size={40} />}
            color="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-200"
            alert={urgentTicketsCount > 0}
          />
          <SummaryCard
            label="Notas não cadastradas WMS"
            value={recebimentoData.length}
            icon={<Truck size={40} />}
            color="text-[#1E8F4A]"
            bgColor="bg-[#2ECC71]/10"
            borderColor="border-[#2ECC71]/30"
            alert={recebimentoData.some(item => item.horasPendentes >= 3)}
          />
          <SummaryCard
            label="Tickets Atrasados > 24h"
            value={delayedTicketsCount}
            icon={<Clock size={40} />}
            color="text-orange-600"
            bgColor="bg-orange-50"
            borderColor="border-orange-200"
            alert={delayedTicketsCount > 0}
          />
          <SummaryCard
            label="Erros de Etiqueta (Hoje)"
            value={labelErrorData.totalToday}
            icon={<ShieldAlert size={40} />}
            color="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-200"
            alert={labelErrorData.totalToday > 15}
          />
        </div>

        {/* SECTION 2: Horizontal Health Analytics */}
        <div className="space-y-8 pt-6">
          <div className="flex items-center gap-4 border-t border-[#D6D8D8] pt-10">
            <Activity size={32} className="text-[#2ECC71]" />
            <h2 className="text-3xl font-black tracking-tighter uppercase text-[#2A2A2E]">Análise de Saúde da <span className="text-[#2ECC71]">Operação</span></h2>
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
          <div className="flex items-center justify-between border-t border-[#D6D8D8] pt-10">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4 uppercase text-[#2A2A2E]">
              <Target size={32} className="text-red-500" />
              Fila de Atendimento <span className="text-[#2ECC71]">Crítica</span>
            </h2>
            <span className="px-6 py-2 bg-white rounded-2xl border border-[#D6D8D8] text-[#2A2A2E]/60 font-mono text-lg font-bold shadow-sm">
              {criticalTickets.length} Ocorrências Relevantes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {criticalTickets.length === 0 ? (
              <div className="col-span-full h-[300px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-[#D6D8D8]">
                <CheckCircle2 size={80} className="text-[#2ECC71] transition-all mb-6" />
                <p className="text-2xl text-[#2A2A2E]/40 font-bold uppercase tracking-widest">Nenhuma ocorrência crítica no radar</p>
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
                    className={`relative overflow-hidden bg-white border p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.01] hover:shadow-md flex flex-col justify-between h-auto min-h-[160px] shadow-sm ${isUrgent ? "border-red-300 ring-1 ring-red-200 shadow-red-100" : "border-[#D6D8D8]"}`}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl shrink-0 ${isUrgent ? "bg-red-500 text-white" : "bg-[#F4F6F5] text-[#2A2A2E]/50 border border-[#D6D8D8]"}`}>
                        <span className="text-[9px] font-black uppercase mb-1">GRAVIDADE</span>
                        <span className="text-lg font-black uppercase leading-none">{priority}</span>
                      </div>

                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black truncate text-[#2A2A2E]">
                            {ticket.name || "Sem Nome"}
                          </h3>
                          {isDelayed && (
                            <span className="px-3 py-1 bg-orange-100 border border-orange-300 text-orange-600 text-[10px] font-black rounded-full uppercase">
                              OVERDUE
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 bg-[#F4F6F5] px-3 py-1.5 rounded-xl border border-[#D6D8D8]">
                            <Users size={16} className="text-[#2ECC71]" />
                            <span className="text-lg font-bold text-[#2A2A2E]">{ticket.client || "---"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ticket.statusColor || '#D6D8D8' }} />
                            <span className="text-lg font-bold text-[#2A2A2E]/60 lowercase">{ticket.ticketStatus || "---"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[#D6D8D8] pt-4">
                      <div className="text-base text-[#2A2A2E]/40 font-mono font-black">
                        {!isNaN(createdDate.getTime()) ? formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR }) : "--"}
                      </div>
                      <a
                        href={ticket.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-[#2ECC71]/10 hover:bg-[#2ECC71] text-[#1E8F4A] hover:text-white rounded-xl transition-all border border-[#2ECC71]/30"
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
  borderColor: string;
  alert?: boolean;
}

function SummaryCard({ label, value, icon, color, bgColor, borderColor, alert }: SummaryCardProps) {
  return (
    <div className={`relative overflow-hidden p-8 rounded-[3rem] border backdrop-blur-2xl transition-all duration-500 bg-white shadow-sm ${alert ? "border-red-300 ring-1 ring-red-100 animate-pulse" : `${borderColor} hover:shadow-md`}`}>
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-4">
          <p className="text-[#2A2A2E]/50 uppercase tracking-[0.2em] font-black text-sm">{label}</p>
          <p className={`text-7xl font-black tracking-tighter ${color}`}>{value}</p>
        </div>
        <div className={`p-6 rounded-[2.5rem] ${bgColor} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-[#2ECC71] opacity-30 transition-all w-full" />
    </div>
  );
}