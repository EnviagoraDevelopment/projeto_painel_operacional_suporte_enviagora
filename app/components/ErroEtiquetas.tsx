
"use client";

import { cn } from "@/lib/utils";
import {
    AlertOctagon,
    BarChart3,
    User,
    AlertTriangle,
    TrendingDown,
    Activity
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface LabelErrorSummary {
    totalToday: number;
    errorsByClient: { name: string; value: number }[];
}

interface Props {
    data: LabelErrorSummary;
}

export function ErroEtiquetas({ data }: Props) {
    const ERROR_THRESHOLD = 15; // "Acima do padrão"

    const criticalClients = data.errorsByClient.filter(c => c.value > ERROR_THRESHOLD);
    const topClients = data.errorsByClient.slice(0, 5);

    return (
        <section className="space-y-10">
            {/* Header com Resumo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-red-500/20 rounded-[2rem] flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <AlertOctagon size={44} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                            Erros de <span className="text-zinc-500">Etiqueta</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-3 py-1 bg-white/5 rounded-lg text-zinc-400 font-bold uppercase tracking-widest text-[10px] border border-white/5">
                                Qualidade Operacional
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Acompanhamento Diário de Retrabalho</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-8 py-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] animate-pulse">
                    <TrendingDown size={28} className="text-red-500" />
                    <div className="flex flex-col">
                        <span className="text-red-500 font-black text-2xl leading-none">
                            {data.totalToday} ERROS HOJE
                        </span>
                        <span className="text-red-400/60 font-black text-[10px] uppercase tracking-widest">Total consolidado</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Gráfico de Distribuição */}
                <div className="bg-zinc-900/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                            <BarChart3 size={20} className="text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Distribuição <span className="text-zinc-500">por Cliente</span></h3>
                    </div>

                    <div className="h-[400px] w-full">
                        {data.errorsByClient.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Sem dados de erro hoje</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topClients} layout="vertical" margin={{ left: 20, right: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontWeight: '900', fontSize: 12 }}
                                        width={150}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px' }}
                                        labelStyle={{ color: '#fff', fontWeight: '900' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>
                                        {topClients.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.value > ERROR_THRESHOLD ? '#ef4444' : '#3b82f6'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
