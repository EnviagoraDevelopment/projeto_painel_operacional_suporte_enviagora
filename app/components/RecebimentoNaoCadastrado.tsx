
"use client";

import { useState } from "react";
import {
    Truck,
    CheckCircle2,
    AlertTriangle,
    FileText,
    User,
    Clock,
    Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { RecebimentoNF } from "../actions/sheets";

interface Props {
    initialData: RecebimentoNF[];
}

export function RecebimentoNaoCadastrado({ initialData }: Props) {
    const data = initialData; // Use props directly to allow server refresh to update the UI

    const CRITICAL_THRESHOLD = 3; // 3 hours

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20">
                        <Truck size={36} className="text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">
                            Recebimento <span className="text-zinc-500">Inbound</span>
                        </h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-2">Controle de Notas Não Cadastradas no WMS</p>
                    </div>
                </div>
                <div className="px-8 py-3 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-zinc-100 font-black uppercase tracking-widest text-lg">
                        {data.length} <span className="text-emerald-500">Pendentes</span>
                    </span>
                </div>
            </div>

            <div className="bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden">
                {data.length === 0 ? (
                    <div className="h-[400px] flex flex-col items-center justify-center p-12">
                        <CheckCircle2 size={100} className="text-emerald-500 mb-6 opacity-20" />
                        <p className="text-3xl text-zinc-500 font-bold uppercase tracking-widest">Tudo em dia no recebimento</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-10 py-8 text-zinc-500 font-black uppercase tracking-[0.2em] text-xs">Cliente</th>
                                    <th className="px-10 py-8 text-zinc-500 font-black uppercase tracking-[0.2em] text-xs text-center">NF Número</th>
                                    <th className="px-10 py-8 text-zinc-500 font-black uppercase tracking-[0.2em] text-xs text-center">Horário/Data</th>
                                    <th className="px-10 py-8 text-zinc-500 font-black uppercase tracking-[0.2em] text-xs text-center">Status Operacional</th>
                                    <th className="px-10 py-8 text-zinc-500 font-black uppercase tracking-[0.2em] text-xs text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.map((item) => {
                                    const isCritical = item.horasPendentes >= CRITICAL_THRESHOLD;

                                    return (
                                        <tr
                                            key={item.row}
                                            className={cn(
                                                "group hover:bg-white/[0.02] transition-colors",
                                                isCritical && "bg-red-500/[0.01]"
                                            )}
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                        isCritical ? "bg-red-500/20 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                                                    )}>
                                                        <User size={24} />
                                                    </div>
                                                    <span className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-emerald-400 transition-colors">
                                                        {item.cliente}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                                        <FileText size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nota Fiscal</span>
                                                    </div>
                                                    <span className="text-3xl font-black text-zinc-100 font-mono tracking-tighter">
                                                        {item.nf}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                                        <Calendar size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Entrada</span>
                                                    </div>
                                                    <span className="text-2xl font-bold text-zinc-300">
                                                        {item.horarioCadastro}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn(
                                                        "flex items-center gap-3 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-xs",
                                                        isCritical
                                                            ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                                            : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500/70"
                                                    )}>
                                                        {isCritical ? (
                                                            <>
                                                                <AlertTriangle size={18} className="animate-bounce" />
                                                                CRÍTICO: {item.horasPendentes.toFixed(1)}H
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock size={18} />
                                                                {item.horasPendentes.toFixed(1)}H PENDENTE
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <ConfirmButton cliente={item.cliente} nf={item.nf} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

function ConfirmButton({ cliente, nf }: { cliente: string; nf: string }) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const router = useRouter();

    async function handleConfirm() {
        if (status === "loading" || status === "success") return;

        setStatus("loading");
        try {
            const { confirmInboundNF } = await import("../actions/sheets");
            const result = await confirmInboundNF(cliente, nf);

            if (result.success) {
                setStatus("success");
                // Refresh only this part of the server data
                router.refresh();
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
            }
        } catch (e) {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    }

    return (
        <button
            onClick={handleConfirm}
            disabled={status === "loading" || status === "success"}
            className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                status === "idle" && "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.2)]",
                status === "loading" && "bg-zinc-800 text-zinc-500 cursor-wait",
                status === "success" && "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20",
                status === "error" && "bg-red-500 text-white animate-shake"
            )}
        >
            {status === "idle" && <>CONFIRMAR RECEBIMENTO</>}
            {status === "loading" && <>PROCESSANDO...</>}
            {status === "success" && (
                <>
                    <CheckCircle2 size={14} />
                    ENVIADO!
                </>
            )}
            {status === "error" && <>ERRO NO ENVIO</>}
        </button>
    );
}
