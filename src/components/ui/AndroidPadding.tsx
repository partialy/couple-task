export default function AndroidPadding({
    test = false,
    className = '',
}) {
  return (
    test ? (
        <div className='h-10 android-safe-height bg-red-200 dark:bg-slate-900/80'></div>
      ) : (
      <div className={`h-0 android-safe-height ${className || 'bg-white/80 dark:bg-slate-900/80'}`}></div>
    )
  );
}