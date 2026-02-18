
"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LabelList
} from "recharts";

interface VisualAnalyticsProps {
    statusData: { name: string; value: number }[];
    clientData: { name: string; value: number }[];
    priorityData: { name: string; value: number }[];
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"];

const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (value === 0) return null;

    return (
        <text
            x={x}
            y={y}
            fill="#a1a1aa"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={12}
            fontWeight="bold"
        >
            {`${name} (${value})`}
        </text>
    );
};

export function VisualAnalytics({ statusData, clientData, priorityData }: VisualAnalyticsProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[3rem] h-[500px] animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Distribution - Donut */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[3rem] h-[500px] flex flex-col">
                <h3 className="text-2xl font-black mb-6 text-zinc-100 flex items-center gap-3">
                    <span className="w-3 h-8 bg-purple-500 rounded-full" />
                    DISTRIBUIÇÃO STATUS
                </h3>
                <div className="flex-1 w-full scale-105 min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                label={renderCustomizedPieLabel}
                                labelLine={{ stroke: '#3f3f46', strokeWidth: 1 }}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "20px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Client Distribution - Horizontal Bar */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[3rem] h-[500px] flex flex-col">
                <h3 className="text-2xl font-black mb-6 text-zinc-100 flex items-center gap-3">
                    <span className="w-3 h-8 bg-blue-500 rounded-full" />
                    TICKETS ABERTOS POR CLIENTES
                </h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <BarChart
                            layout="vertical"
                            data={clientData.slice(0, 8)}
                            margin={{ top: 5, right: 60, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#a1a1aa"
                                fontSize={14}
                                width={120}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "#27272a" }}
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "20px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 12, 12, 0]} barSize={32}>
                                <LabelList dataKey="value" position="right" fill="#fff" fontSize={18} fontWeight="bold" offset={20} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[3rem] h-[500px] flex flex-col">
                <h3 className="text-2xl font-black mb-6 text-zinc-100 flex items-center gap-3">
                    <span className="w-3 h-8 bg-red-500 rounded-full" />
                    PRIORIDADES
                </h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <BarChart data={priorityData} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={14} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: "#27272a" }}
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "20px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Bar dataKey="value" fill="#ef4444" radius={[16, 16, 0, 0]} barSize={70}>
                                <LabelList dataKey="value" position="top" fill="#fff" fontSize={22} fontWeight="bold" offset={20} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
