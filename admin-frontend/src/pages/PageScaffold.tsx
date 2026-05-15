import { ReactNode } from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function PageScaffold({ title, description, actions, children }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-[var(--text-main)]">{title}</CardTitle>
          {description && <CardDescription className="text-[var(--text-muted)]">{description}</CardDescription>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
