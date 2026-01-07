import React from 'react';
import { Status } from '../constants';

export const StatusBadge = ({ status, size = 'md' }) => {
  let colorClasses = '';

  let bgColor = '#F3F4F6';
  let textColor = '#6B7280';
  let borderColor = '#E5E7EB';
  let dotColor = '#9CA3AF';

  switch (status) {
    case Status.ACTIVE:
      bgColor = '#F3F0FF';
      textColor = '#6442E7';
      borderColor = '#E9E0FF';
      dotColor = '#6442E7';
      break;
    case Status.IN_PROGRESS:
      bgColor = '#F3F0FF';
      textColor = '#6442E7';
      borderColor = '#E9E0FF';
      dotColor = '#6442E7';
      break;
    case Status.TODO:
      bgColor = '#FEF3C7';
      textColor = '#B45309';
      borderColor = '#FCD34D';
      dotColor = '#F59E0B';
      break;
    case Status.ARCHIVED:
      bgColor = '#F3F4F6';
      textColor = '#4B5563';
      borderColor = '#E5E7EB';
      dotColor = '#9CA3AF';
      break;
    default:
      bgColor = '#F3F4F6';
      textColor = '#4B5563';
      borderColor = '#E5E7EB';
      dotColor = '#9CA3AF';
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';

  return (
    <span className={`inline-flex items-center justify-center rounded-full border ${sizeClasses}`} style={{backgroundColor: bgColor, color: textColor, borderColor: borderColor}}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5`} style={{backgroundColor: dotColor}}></span>
      {status}
    </span>
  );
};

