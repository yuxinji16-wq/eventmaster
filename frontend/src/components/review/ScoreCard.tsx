import React from 'react';

interface ScoreCardProps {
  label: string;
  score: number;
  color: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, color }) => {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className={`rounded-xl p-4 text-center ${colorClasses[color]}`}>
      <p className="text-2xl font-black">{score.toFixed(1)}</p>
      <p className="text-xs mt-1">{label}</p>
    </div>
  );
};

export default ScoreCard;
