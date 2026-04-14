import React from 'react';
import { Target, SkipForward, Flame, Clock } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

const formatActiveTime = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const text = [];
  if (hours > 0) text.push(`${hours}h`);
  
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (minutes > 0 || hours === 0) text.push(`${minutes}m`);
  
  return text.join(' ');
};

export const StatisticsPanel: React.FC = () => {
  const { stats } = useSession();

  const statCards = [
    {
      label: 'Completed Breaks',
      value: stats.totalCompleted,
      icon: <Target className="text-green-500" size={24} />,
      bg: 'bg-green-50/50 dark:bg-green-500/10'
    },
    {
      label: 'Skipped Breaks',
      value: stats.totalSkipped,
      icon: <SkipForward className="text-gray-500" size={24} />,
      bg: 'bg-gray-50/50 dark:bg-gray-500/10'
    },
    {
      label: 'Current Streak',
      value: stats.currentStreak,
      icon: <Flame className="text-orange-500" size={24} />,
      bg: 'bg-orange-50/50 dark:bg-orange-500/10'
    },
    {
      label: 'Active Time',
      value: formatActiveTime(stats.totalActiveTimeMs),
      icon: <Clock className="text-blue-500" size={24} />,
      bg: 'bg-blue-50/50 dark:bg-blue-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statCards.map((stat, idx) => (
        <div key={idx} className={`p-4 rounded-2xl ${stat.bg} border border-[var(--text-primary)]/5 flex flex-col gap-3`}>
          <div className="w-10 h-10 rounded-full bg-white dark:bg-[var(--surface-color)] shadow-sm flex items-center justify-center">
            {stat.icon}
          </div>
          <div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-[var(--text-primary)]/60 font-medium">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
