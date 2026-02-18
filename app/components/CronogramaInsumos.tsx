
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Calendar,
    ClipboardCheck,
    History,
    User,
    CheckCircle2,
    Clock,
    LayoutGrid,
    AlertCircle,
    CalendarDays
} from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClickUpTask {
    id: string;
    name: string;
    originalName: string;
    status: string;
    client?: string;
    dueDate?: string;
    startDate?: string;
    dateClosed?: string;
    url: string;
}

interface Props {
    tasks: ClickUpTask[];
}

export function CronogramaInsumos({ tasks }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Filtra apenas tarefas que são de Insumo (Semanal ou Quinzenal)
    const insumoTasks = tasks.filter(t => {
        const name = t.originalName.toLowerCase();
        return name.includes("insumo semanal") || name.includes("insumo quinzenal");
    });

    // Contagens Programadas para a data selecionada
    const scheduledCounts = insumoTasks.filter(t => {
        if (t.status.toLowerCase() === 'concluído') return false;
        if (!t.dueDate) return false;
        const due = new Date(parseInt(t.dueDate));
        return isSameDay(due, selectedDate);
    });

    // Últimas contagens realizadas (Geral)
    const lastCounts = insumoTasks
        .filter(t => t.dateClosed && t.status.toLowerCase() === 'concluído')
        .sort((a, b) => parseInt(b.dateClosed!) - parseInt(a.dateClosed!))
        .slice(0, 5);

    // Todos os clientes que possuem tarefas de insumo
    const allClients = Array.from(new Set(insumoTasks.map(t => t.client).filter(Boolean)));

    const isTodaySelected = isToday(selectedDate);

    return (
        <section className="space-y-10">
            {/* Header com Resumo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <ClipboardCheck size={44} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                            Cronograma <span className="text-zinc-500">Insumos</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-3 py-1 bg-white/5 rounded-lg text-zinc-400 font-bold uppercase tracking-widest text-[10px] border border-white/5">
                                Operação Logística
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Precisão e Controle de Saldo</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Seletor de Data */}
                    <div className="relative group">
                        <div className="flex items-center gap-3 px-6 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer">
                            <CalendarDays size={20} className="text-blue-500" />
                            <div className="flex flex-col">
                                <span className="text-xs text-zinc-500 font-black uppercase tracking-widest">Filtrar Data</span>
                                <span className="text-sm font-black text-zinc-200 uppercase">
                                    {isTodaySelected ? "Hoje" : format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                                </span>
                            </div>
                            <input
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        // Ajuste para evitar problemas de timezone ao converter string para Date
                                        const [year, month, day] = e.target.value.split('-').map(Number);
                                        setSelectedDate(new Date(year, month - 1, day));
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-8 py-5 bg-blue-500/10 border border-blue-500/20 rounded-[2rem]">
                        <Calendar size={28} className="text-blue-500" />
                        <div className="flex flex-col">
                            <span className="text-blue-500 font-black text-2xl leading-none">
                                {isTodaySelected ? "HOJE" : format(selectedDate, "dd/MM")} TEMOS {scheduledCounts.length} PROGRAMADAS
                            </span>
                            <span className="text-blue-400/60 font-black text-[10px] uppercase tracking-widest">
                                Contagens para {isTodaySelected ? "hoje" : "o dia selecionado"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna 1: Contagens do Dia (Selecionado) */}
                <div className="bg-zinc-900/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <Clock size={20} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">
                            {isTodaySelected ? "Hoje" : format(selectedDate, "dd/MM")} <span className="text-zinc-500">na fila</span>
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {scheduledCounts.length === 0 ? (
                            <div className="py-12 flex flex-col items-center text-center">
                                <CheckCircle2 size={48} className="text-zinc-800 mb-4" />
                                <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">Nenhuma contagem pendente para este dia</p>
                            </div>
                        ) : (
                            scheduledCounts.map(task => (
                                <div key={task.id} className="group bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 rounded-md">
                                            <User size={12} className="text-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest line-clamp-1">{task.client}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-500 font-bold">
                                            {task.dueDate ? format(new Date(parseInt(task.dueDate)), "HH:mm") : "--:--"}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors leading-tight">
                                        {task.originalName}
                                    </h4>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Coluna 2: Mapa de Clientes */}
                <div className="bg-zinc-900/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/20">
                            <LayoutGrid size={20} className="text-orange-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Base de <span className="text-zinc-500">Controle</span></h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allClients.map(client => {
                            // Encontrar a próxima contagem para este cliente
                            const nextCounting = insumoTasks
                                .filter(t => t.client === client && t.status.toLowerCase() !== 'concluído' && t.dueDate)
                                .sort((a, b) => parseInt(a.dueDate!) - parseInt(b.dueDate!))[0];

                            return (
                                <div key={client} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                            <User size={14} className="text-zinc-500" />
                                        </div>
                                        <span className="text-sm font-black text-zinc-200 uppercase truncate max-w-[120px]">{client}</span>
                                    </div>
                                    {nextCounting && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Próxima</span>
                                            <span className="text-xs font-black text-orange-500">
                                                {format(new Date(parseInt(nextCounting.dueDate!)), "dd/MM")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                            <span>Total Clientes Mapeados</span>
                            <span className="text-zinc-100">{allClients.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
