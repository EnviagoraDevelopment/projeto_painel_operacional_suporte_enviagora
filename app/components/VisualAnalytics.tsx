
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
    Legend
} from "recharts";

interface VisualAnalyticsProps {
    statusData: { name: string; value: number }[];
    clientData: { name: string; value: number }[];
    priorityData: { name: string; value: number }[];
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"];

export function VisualAnalytics({ statusData, clientData, priorityData }: VisualAnalyticsProps) {
    return (
        <div className="grid grid-cols-1 gap-8">
            {/* Status Distribution - Donut */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-[2.5rem] h-[400px] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full" />
                    Distribuição por Status
                </h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Client Distribution - Horizontal Bar */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-[2.5rem] h-[450px] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full" />
                    Top Clientes
                </h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={clientData.slice(0, 8)}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#a1a1aa"
                                fontSize={12}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: "#27272a" }}
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-[2.5rem] h-[300px] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-500 rounded-full" />
                    Níveis de Prioridade
                </h3>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityData}>
                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: "#27272a" }}
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px" }}
                                itemStyle={{ color: "#f4f4f5" }}
                            />
                            <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
