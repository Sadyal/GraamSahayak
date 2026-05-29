import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-pending';
  let displayName = status || 'Pending';

  if (status === 'In Progress') {
    badgeClass = 'badge-progress';
  } else if (status === 'Resolved' || status === 'Approved') {
    badgeClass = 'badge-resolved';
  } else if (status === 'Rejected') {
    badgeClass = 'badge-rejected';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {displayName}
    </span>
  );
};

export default StatusBadge;
