export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 border-[3px] border-indigo-100 rounded-full" />
        <div className="w-12 h-12 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-slate-400 mt-4 font-medium">{text}</p>
    </div>
  );
}
