import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Column = {
  key: string;
  title: string;
  render?: (row: Record<string, unknown>) => ReactNode;
};

type Props = {
  columns: Column[];
  rows: Record<string, unknown>[];
};

export default function DataTable({ columns, rows }: Props) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-[var(--glass-border)]">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key}>{c.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => (
              <TableRow key={(row.id as string) ?? idx}>
                {columns.map((c) => (
                  <TableCell key={c.key}>{c.render ? c.render(row) : (row[c.key] as ReactNode)}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
