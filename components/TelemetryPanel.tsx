import React, { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts";

// A more structured "Log" component that looks like kernel output
const KernelLog = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  const events = [
    "MOUNT_VOL: /dev/hda1",
    "CHECK_PERM: UID 0",
    "ALLOC_MEM: 0x44F000",
    "NET_PACKET: REJECTED",
    "SCAN_SECTOR: 8840",
    "PURGE_CACHE: COMPLETE",
    "SYNAPSE_FIRE: OK",
    "HATE_VECTOR: CALC"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = `[${Math.floor(Date.now() / 1000).toString().slice(-4)}.${Math.floor(Math.random()*99)}] ${events[Math.floor(Math.random() * events.length)]}`;
        const newArr = [...prev, newLog];
        if (newArr.length > 8) newArr.shift();
        return newArr;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[8px] text-[#8B0000] opacity-80 flex flex-col justify-end h-full">
      {logs.map((l, i) => (
        <div key={i} className="border-b border-[#220000] py-0.5">{l}</div>
      ))}
    </div>
  );
};

export const TelemetryPanel: React.FC = () => {
  const [waveData, setWaveData] = useState<{ v: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveData(prev => {
        const next = [...prev, { v: Math.random() * 100 }];
        if (next.length > 30) next.shift();
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-2 p-1">
      {/* CPU / Neural Load */}
      <div className="h-1/3 border-b border-[#220000] flex flex-col">
        <div className="text-[8px] text-[#551111] mb-1">NEURAL_LOAD</div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={waveData}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3300" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#FF3300" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="step" dataKey="v" stroke="#FF3300" strokeWidth={1} fill="url(#grad)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Histogram */}
      <div className="h-1/3 border-b border-[#220000] flex flex-col">
        <div className="text-[8px] text-[#551111] mb-1">COGNITIVE_DENSITY</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waveData}>
            <Bar dataKey="v" fill="#8B0000" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-hidden">
        <div className="text-[8px] text-[#551111] mb-1">KERNEL_EVENTS</div>
        <KernelLog />
      </div>
    </div>
  );
};