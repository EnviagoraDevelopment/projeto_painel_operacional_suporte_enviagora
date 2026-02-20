"use client";

import { cn } from "@/lib/utils";
import {
    AlertOctagon,
    BarChart3,
    TrendingDown,
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
    const ERROR_THRESHOLD = 15;

    const topClients = data.errorsByClient.slice(0, 5);

    return (
        <section className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#D6D8D8] pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center border border-red-200">
                        <AlertOctagon size={44} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none text-[#2A2A2E]">
                            Erros de <span className="text-[#2ECC71]">Etiqueta</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-3 py-1 bg-[#F4F6F5] rounded-lg text-[#2A2A2E]/50 font-bold uppercase tracking-widest text-[10px] border border-[#D6D8D8]">
                                Qualidade Operacional
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D6D8D8]" />
                            <p className="text-[#2A2A2E]/40 font-bold uppercase tracking-widest text-xs">Acompanhamento Diário de Retrabalho</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-8 py-5 bg-red-50 border border-red-200 rounded-[2rem]">
                    <TrendingDown size={28} className="text-red-500" />
                    <div className="flex flex-col">
                        <span className="text-red-600 font-black text-2xl leading-none">
                            {data.totalToday} ERROS HOJE
                        </span>
                        <span className="text-red-400 font-black text-[10px] uppercase tracking-widest">Total consolidado</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Gráfico de Distribuição */}
                <div className="bg-white border border-[#D6D8D8] rounded-[3rem] p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-200">
                            <BarChart3 size={20} className="text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-[#2A2A2E]">Distribuição <span className="text-[#2ECC71]">por Cliente</span></h3>
                    </div>

                    <div className="h-[400px] w-full">
                        {data.errorsByClient.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center bg-[#F4F6F5] rounded-2xl border border-dashed border-[#D6D8D8]">
                                <p className="text-[#2A2A2E]/40 font-bold uppercase tracking-widest text-sm">Sem dados de erro hoje</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topClients} layout="vertical" margin={{ left: 20, right: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#D6D8D8" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#2A2A2E', fontWeight: '900', fontSize: 12 }}
                                        width={150}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D6D8D8', borderRadius: '16px' }}
                                        labelStyle={{ color: '#2A2A2E', fontWeight: '900' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>
                                        {topClients.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.value > ERROR_THRESHOLD ? '#ef4444' : '#2ECC71'}
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