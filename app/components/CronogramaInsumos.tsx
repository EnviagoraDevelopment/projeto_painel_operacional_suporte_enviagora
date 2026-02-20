"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Calendar,
    ClipboardCheck,
    User,
    CheckCircle2,
    Clock,
    LayoutGrid,
    CalendarDays
} from "lucide-react";
import { format, isToday, isSameDay } from "date-fns";
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

    const insumoTasks = tasks.filter(t => {
        const name = t.originalName.toLowerCase();
        return name.includes("insumo semanal") || name.includes("insumo quinzenal");
    });

    const scheduledCounts = insumoTasks.filter(t => {
        if (t.status.toLowerCase() === 'concluído') return false;
        if (!t.dueDate) return false;
        const due = new Date(parseInt(t.dueDate));
        return isSameDay(due, selectedDate);
    });

    const allClients = Array.from(new Set(insumoTasks.map(t => t.client).filter(Boolean)));
    const isTodaySelected = isToday(selectedDate);

    return (
        <section className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D6D8D8] pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#2ECC71]/10 rounded-[2rem] flex items-center justify-center border border-[#2ECC71]/30">
                        <ClipboardCheck size={44} className="text-[#1E8F4A]" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none text-[#2A2A2E]">
                            Cronograma <span className="text-[#2ECC71]">Insumos</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-3 py-1 bg-[#F4F6F5] rounded-lg text-[#2A2A2E]/50 font-bold uppercase tracking-widest text-[10px] border border-[#D6D8D8]">
                                Operação Logística
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D6D8D8]" />
                            <p className="text-[#2A2A2E]/40 font-bold uppercase tracking-widest text-xs">Precisão e Controle de Saldo</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Seletor de Data */}
                    <div className="relative group">
                        <div className="flex items-center gap-3 px-6 py-4 bg-white border border-[#D6D8D8] rounded-2xl hover:border-[#2ECC71] transition-all cursor-pointer shadow-sm">
                            <CalendarDays size={20} className="text-[#2ECC71]" />
                            <div className="flex flex-col">
                                <span className="text-xs text-[#2A2A2E]/40 font-black uppercase tracking-widest">Filtrar Data</span>
                                <span className="text-sm font-black text-[#2A2A2E] uppercase">
                                    {isTodaySelected ? "Hoje" : format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                                </span>
                            </div>
                            <input
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [year, month, day] = e.target.value.split('-').map(Number);
                                        setSelectedDate(new Date(year, month - 1, day));
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-8 py-5 bg-[#2ECC71]/10 border border-[#2ECC71]/30 rounded-[2rem]">
                        <Calendar size={28} className="text-[#1E8F4A]" />
                        <div className="flex flex-col">
                            <span className="text-[#1E8F4A] font-black text-2xl leading-none">
                                {isTodaySelected ? "HOJE" : format(selectedDate, "dd/MM")} TEMOS {scheduledCounts.length} PROGRAMADAS
                            </span>
                            <span className="text-[#1E8F4A]/50 font-black text-[10px] uppercase tracking-widest">
                                Contagens para {isTodaySelected ? "hoje" : "o dia selecionado"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna 1: Contagens do Dia */}
                <div className="bg-white border border-[#D6D8D8] rounded-[3rem] p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#2ECC71]/10 rounded-xl flex items-center justify-center border border-[#2ECC71]/30">
                            <Clock size={20} className="text-[#1E8F4A]" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-[#2A2A2E]">
                            {isTodaySelected ? "Hoje" : format(selectedDate, "dd/MM")} <span className="text-[#2ECC71]">na fila</span>
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {scheduledCounts.length === 0 ? (
                            <div className="py-12 flex flex-col items-center text-center">
                                <CheckCircle2 size={48} className="text-[#D6D8D8] mb-4" />
                                <p className="text-[#2A2A2E]/30 font-bold uppercase text-xs tracking-widest">Nenhuma contagem pendente para este dia</p>
                            </div>
                        ) : (
                            scheduledCounts.map(task => (
                                <div key={task.id} className="group bg-[#F4F6F5] border border-[#D6D8D8] p-5 rounded-2xl hover:border-[#2ECC71] transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 bg-[#2ECC71]/10 px-2 py-1 rounded-md">
                                            <User size={12} className="text-[#1E8F4A]" />
                                            <span className="text-[10px] font-black text-[#1E8F4A] uppercase tracking-widest line-clamp-1">{task.client}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-[#2A2A2E]/40 font-bold">
                                            {task.dueDate ? format(new Date(parseInt(task.dueDate)), "HH:mm") : "--:--"}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black text-[#2A2A2E] group-hover:text-[#1E8F4A] transition-colors leading-tight">
                                        {task.originalName}
                                    </h4>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Coluna 2: Mapa de Clientes */}
                <div className="bg-white border border-[#D6D8D8] rounded-[3rem] p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-200">
                            <LayoutGrid size={20} className="text-orange-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-[#2A2A2E]">Base de <span className="text-[#2ECC71]">Controle</span></h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allClients.map(client => {
                            const nextCounting = insumoTasks
                                .filter(t => t.client === client && t.status.toLowerCase() !== 'concluído' && t.dueDate)
                                .sort((a, b) => parseInt(a.dueDate!) - parseInt(b.dueDate!))[0];

                            return (
                                <div key={client} className="bg-[#F4F6F5] border border-[#D6D8D8] p-4 rounded-2xl flex items-center justify-between group hover:border-[#2ECC71] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-[#D6D8D8] flex items-center justify-center shrink-0">
                                            <User size={14} className="text-[#2ECC71]" />
                                        </div>
                                        <span className="text-sm font-black text-[#2A2A2E] uppercase truncate max-w-[120px]">{client}</span>
                                    </div>
                                    {nextCounting && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black text-[#2A2A2E]/40 uppercase tracking-widest">Próxima</span>
                                            <span className="text-xs font-black text-orange-500">
                                                {format(new Date(parseInt(nextCounting.dueDate!)), "dd/MM")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-4 border-t border-[#D6D8D8]">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[#2A2A2E]/40">
                            <span>Total Clientes Mapeados</span>
                            <span className="text-[#2A2A2E]">{allClients.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}