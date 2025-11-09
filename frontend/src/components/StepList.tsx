import { motion } from 'framer-motion';

export interface Step {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
}

interface StepListProps {
  steps: Step[];
}

const statusIcons = {
  pending: '⏳',
  in_progress: '🔄',
  completed: '✓',
  failed: '✗',
};

const statusColors = {
  pending: 'text-gray-500',
  in_progress: 'text-blue-400 animate-pulse',
  completed: 'text-green-400',
  failed: 'text-red-400',
};

export default function StepList({ steps }: StepListProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-center gap-3 p-3 rounded-lg glass ${
            step.status === 'in_progress' ? 'ring-1 ring-blue-500/50' : ''
          }`}
        >
          <span className={`text-xl ${statusColors[step.status]}`}>
            {statusIcons[step.status]}
          </span>

          <div className="flex-1">
            <p className="text-sm font-medium text-white">{step.name}</p>
            {step.status === 'in_progress' && (
              <p className="text-xs text-blue-300 mt-1">En cours...</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
