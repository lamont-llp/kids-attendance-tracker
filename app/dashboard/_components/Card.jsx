import React from 'react';

function Card({ icon, title, value }) {
  return (
    <div className="flex items-center gap-5 p-7 bg-primary dark:bg-secondary rounded-lg shadow overflow-hidden">
      <div className="p-2 h-10 w-10 rounded-full bg-white text-primary dark:text-primary-foreground">
        {icon}
      </div>
      <div>
        <h2 className="font-bold">{title}</h2>
        <h2 className="text-lg">{value}</h2>
      </div>
    </div>
  );
}

export default Card;
