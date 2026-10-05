import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  isPositive = true,
  color
}) => {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-info">
        <span>{label}</span>
        <h3>{value}</h3>
        {trend && (
          <div className={`admin-stat-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div 
        className="admin-stat-icon-wrapper" 
        style={color ? { background: `${color}20`, color: color } : undefined}
      >
        <Icon size={24} />
      </div>
    </div>
  );
};
