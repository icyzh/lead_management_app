interface Props {
  message?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ message = "Nothing here yet", description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-medium text-zinc-500 mb-1">{message}</p>
      {description && <p className="text-xs text-zinc-700 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
