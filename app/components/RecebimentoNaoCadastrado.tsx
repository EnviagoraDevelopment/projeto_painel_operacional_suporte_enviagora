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
    const data = initialData;
    const CRITICAL_THRESHOLD = 3;

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#2ECC71]/10 rounded-[1.5rem] flex items-center justify-center border border-[#2ECC71]/30">
                        <Truck size={36} className="text-[#1E8F4A]" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase leading-none text-[#2A2A2E]">
                            Recebimento <span className="text-[#2ECC71]">Inbound</span>
                        </h2>
                        <p className="text-[#2A2A2E]/40 font-bold uppercase tracking-widest text-sm mt-2">Controle de Notas Não Cadastradas no WMS</p>
                    </div>
                </div>
                <div className="px-8 py-3 bg-white border border-[#D6D8D8] rounded-2xl flex items-center gap-4 shadow-sm">
                    <div className="w-3 h-3 bg-[#2ECC71] rounded-full animate-pulse" />
                    <span className="text-[#2A2A2E] font-black uppercase tracking-widest text-lg">
                        {data.length} <span className="text-[#2ECC71]">Pendentes</span>
                    </span>
                </div>
            </div>

            <div className="bg-white border border-[#D6D8D8] rounded-[3rem] overflow-hidden shadow-sm">
                {data.length === 0 ? (
                    <div className="h-[400px] flex flex-col items-center justify-center p-12">
                        <CheckCircle2 size={100} className="text-[#2ECC71] mb-6 opacity-30" />
                        <p className="text-3xl text-[#2A2A2E]/30 font-bold uppercase tracking-widest">Tudo em dia no recebimento</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#D6D8D8] bg-[#F4F6F5]">
                                    <th className="px-10 py-8 text-[#2A2A2E]/50 font-black uppercase tracking-[0.2em] text-xs">Cliente</th>
                                    <th className="px-10 py-8 text-[#2A2A2E]/50 font-black uppercase tracking-[0.2em] text-xs text-center">NF Número</th>
                                    <th className="px-10 py-8 text-[#2A2A2E]/50 font-black uppercase tracking-[0.2em] text-xs text-center">Horário/Data</th>
                                    <th className="px-10 py-8 text-[#2A2A2E]/50 font-black uppercase tracking-[0.2em] text-xs text-center">Status Operacional</th>
                                    <th className="px-10 py-8 text-[#2A2A2E]/50 font-black uppercase tracking-[0.2em] text-xs text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D6D8D8]">
                                {data.map((item) => {
                                    const isCritical = item.horasPendentes >= CRITICAL_THRESHOLD;

                                    return (
                                        <tr
                                            key={item.row}
                                            className={cn(
                                                "group hover:bg-[#F4F6F5] transition-colors",
                                                isCritical && "bg-red-50/50"
                                            )}
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                                        isCritical ? "bg-red-100 text-red-500" : "bg-[#2ECC71]/10 text-[#1E8F4A]"
                                                    )}>
                                                        <User size={24} />
                                                    </div>
                                                    <span className="text-2xl font-black text-[#2A2A2E] tracking-tight uppercase group-hover:text-[#1E8F4A] transition-colors">
                                                        {item.cliente}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-2 text-[#2A2A2E]/40 mb-1">
                                                        <FileText size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nota Fiscal</span>
                                                    </div>
                                                    <span className="text-3xl font-black text-[#2A2A2E] font-mono tracking-tighter">
                                                        {item.nf}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-2 text-[#2A2A2E]/40 mb-1">
                                                        <Calendar size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Entrada</span>
                                                    </div>
                                                    <span className="text-2xl font-bold text-[#2A2A2E]/70">
                                                        {item.horarioCadastro}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn(
                                                        "flex items-center gap-3 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-xs",
                                                        isCritical
                                                            ? "bg-red-50 border-red-200 text-red-600"
                                                            : "bg-[#2ECC71]/10 border-[#2ECC71]/30 text-[#1E8F4A]"
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
                status === "idle" && "bg-[#2ECC71] text-white hover:bg-[#1E8F4A] shadow-[0_10px_20px_rgba(46,204,113,0.2)]",
                status === "loading" && "bg-[#F4F6F5] text-[#2A2A2E]/40 cursor-wait border border-[#D6D8D8]",
                status === "success" && "bg-[#2ECC71]/10 text-[#1E8F4A] border border-[#2ECC71]/30",
                status === "error" && "bg-red-500 text-white"
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