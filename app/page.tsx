
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
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const tickets = await getClickUpTickets();

  // Total Open (Excluding 'concluído' or similar closed states)
  const openTickets = tickets.filter(t => t.status.toLowerCase() !== 'concluído' && t.ticketStatus?.toLowerCase() !== 'finalizado');

  // High Priority
  const criticalTickets = openTickets.filter(t => t.priority === 'urgent' || t.priority === 'high');

  // Delayed > 24h
  const delayedTickets = openTickets.filter(t => {
    const createdDate = new Date(parseInt(t.dateCreated));
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return createdDate < yesterday;
  });

  // Group by Status
  const statusGroups = openTickets.reduce((acc: any, t) => {
    const key = t.ticketStatus || "A Definir";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Group by Client
  const clientGroups = openTickets.reduce((acc: any, t) => {
    const key = t.client || "Outros";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 p-6 md:p-10 font-sans selection:bg-purple-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-purple-400">
              <LayoutDashboard size={18} />
              <span className="text-sm font-medium tracking-wider uppercase">Painel Operacional</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Controle de Tickets Suporte
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 p-3 rounded-2xl">
            <Clock size={16} />
            <span>Atualizado: {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Abertos"
            value={openTickets.length.toString()}
            icon={<MessageSquare className="text-blue-400" />}
            gradient="from-blue-500/10 to-transparent"
          />
          <StatCard
            title="Atrasados (+24h)"
            value={delayedTickets.length.toString()}
            icon={<AlertCircle className="text-red-400" />}
            isAlert={delayedTickets.length > 0}
            gradient="from-red-500/10 to-transparent"
          />
          <StatCard
            title="Alta Prioridade"
            value={criticalTickets.length.toString()}
            icon={<AlertTriangle className="text-orange-400" />}
            gradient="from-orange-500/10 to-transparent"
          />
          <StatCard
            title="Taxa de Conclusão"
            value={`${Math.round(((tickets.length - openTickets.length) / tickets.length) * 100)}%`}
            icon={<CheckCircle2 className="text-emerald-400" />}
            gradient="from-emerald-500/10 to-transparent"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* List of Tickets */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="text-purple-400" size={20} />
                Tickets Prioritários
              </h2>
            </div>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {openTickets.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
                  <p className="text-zinc-500">Nenhum ticket aberto no momento.</p>
                </div>
              )}
              {openTickets.map((ticket) => {
                const createdDate = new Date(parseInt(ticket.dateCreated));
                const isDelayed = (Date.now() - createdDate.getTime()) > 24 * 60 * 60 * 1000;
                const isUrgent = ticket.priority === 'urgent' || ticket.priority === 'high';

                return (
                  <div
                    key={ticket.id}
                    className={cn(
                      "group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-5 rounded-2xl transition-all duration-300 hover:border-purple-500/30 hover:bg-zinc-900/60",
                      isUrgent && "border-orange-500/20 bg-orange-500/[0.02]",
                      isDelayed && "border-red-500/20 bg-red-500/[0.02]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            isUrgent ? "bg-orange-500/20 text-orange-400" : "bg-zinc-800 text-zinc-400"
                          )}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR })}
                          </span>
                          {isDelayed && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 animate-pulse uppercase tracking-wider bg-red-400/10 px-2 py-0.5 rounded-md border border-red-400/20">
                              Atrasado
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium group-hover:text-purple-400 transition-colors">
                          {ticket.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Users size={14} className="text-zinc-500" />
                            <span>{ticket.client}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: ticket.statusColor || '#555' }}
                            />
                            <span>{ticket.ticketStatus}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={ticket.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-purple-500/20 rounded-xl transition-all"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Charts/Groups */}
          <div className="space-y-8">
            {/* Status Chart-like list */}
            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 p-6 rounded-3xl">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-blue-400">
                <Target size={18} />
                Status dos Tickets
              </h3>
              <div className="space-y-4">
                {Object.entries(statusGroups).map(([status, count]: [string, any]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">{status}</span>
                      <span className="font-medium text-blue-400">{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{ width: `${(count / openTickets.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 p-6 rounded-3xl">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-emerald-400">
                <Users size={18} />
                Tickets por Cliente
              </h3>
              <div className="space-y-3">
                {Object.entries(clientGroups)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 8)
                  .map(([client, count]: [string, any]) => (
                    <div key={client} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                      <span className="text-sm text-zinc-300 truncate mr-4">{client}</span>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg min-w-[24px] text-center">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, isAlert }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  isAlert?: boolean;
}) {
  return (
    <div className={cn(
      "group relative overflow-hidden bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-[2rem] transition-all duration-500 hover:border-zinc-700 hover:-translate-y-1",
      isAlert && "animate-pulse border-red-500/20"
    )}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", gradient)} />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-zinc-800/50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
          {isAlert && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />}
        </div>
        <div>
          <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase">{title}</p>
          <p className="text-4xl font-bold mt-1 tabular-nums tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
