interface Props {
  size?: "sm" | "md";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: Props) {
  const dim = size === "sm" ? "w-5 h-5" : "w-7 h-7";
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className={`${dim} border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin`} />
    </div>
  );
}

export function InlineSpinner() {
  return (
    <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin inline-block" />
  );
}
