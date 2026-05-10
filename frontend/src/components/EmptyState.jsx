export default function EmptyState({ icon = '📭', title, description, action, actionLabel }) {
  return (
    <div className="glass-card p-8 text-center animate-fade-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-600 mb-1">
        {title}
      </h2>
      <p className="text-sm text-slate-400 mb-5">{description}</p>
      {action && actionLabel && (
        <button onClick={action} className="btn-primary">{actionLabel}</button>
      )}
    </div>
  );
}
