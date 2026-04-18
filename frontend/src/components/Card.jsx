import React from "react";

const Card = (props) => {
  const Icon = props.icon; // Assign to a capitalized variable to use as a component

  return (
    <div className="bg-surface p-6 rounded-card border border-slate-200 shadow-sm">
      <p className="text-t-secondary text-sm font-medium">{props.title}</p>
      <p className="text-2xl font-bold mt-1">{props.value}</p>
      <div className="mt-4 flex items-center gap-1 text-t-placeholder text-xs">
        {Icon && <Icon className="text-[14px]" />}
        <span>{props.description}</span>
      </div>
    </div>
  );
};

export default Card;
