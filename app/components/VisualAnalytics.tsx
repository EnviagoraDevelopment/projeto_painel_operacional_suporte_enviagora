
"use client";

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

const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (value === 0) return null;

    return (
        <text x={x} y={y} fill="#a1a1aa" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
            {`${name} (${value})`}
        </text>
    );
};

export function VisualAnalytics({ statusData, clientData, priorityData }: VisualAnalyticsProps) {
    return (
        <div className="grid grid-cols-1 gap-8">
            {/* Status Distribution - Donut */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-[2.5rem] h-[450px] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full" />
                    Distribuição por Status
                </h3>
                <div className="flex-1 w-full scale-95">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
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
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Client Distribution - Horizontal Bar */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-[2.5rem] h-[500px] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full" />
                    Top Clientes (Tickets)
                </h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={clientData.slice(0, 8)}
                            margin={{ top: 5, right: 40, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#a1a1aa"
                                fontSize={12}
                                width={100}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "#27272a" }}
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24}>
                                <LabelList dataKey="value" position="right" fill="#fff" fontSize={14} fontWeight="bold" offset={10} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-[2.5rem] h-[350px] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-500 rounded-full" />
                    Votos por Prioridade
                </h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: "#27272a" }}
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={50}>
                                <LabelList dataKey="value" position="top" fill="#fff" fontSize={16} fontWeight="bold" offset={10} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
