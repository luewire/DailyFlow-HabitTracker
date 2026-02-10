import { Priority } from '@/types';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles: Record<Priority, { bg: string; text: string; border: string }> = {
    high: { bg: 'rgba(232, 90, 90, 0.15)', text: '#E85A5A', border: 'rgba(232, 90, 90, 0.3)' },
    medium: { bg: 'rgba(245, 200, 66, 0.15)', text: '#F5C842', border: 'rgba(245, 200, 66, 0.3)' },
    low: { bg: 'rgba(0, 230, 118, 0.15)', text: '#00E676', border: 'rgba(0, 230, 118, 0.3)' },
  };

  const s = styles[priority];

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{
        background: s.bg,
        color: s.text,
        borderColor: s.border,
      }}
    >
      {priority}
    </span>
  );
}
