import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";

interface ErrorStateProps {
  message?: string | null;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-coral-soft text-coral">
        <TriangleAlert className="size-5" />
      </span>
      <h3 className="mt-4 text-sm font-bold text-ink">Não foi possível carregar os dados</h3>
      <p className="mt-1 max-w-md text-xs text-muted">
        Verifique se a API do Django está rodando em <code className="font-mono">:8000</code>.
        {message && <span className="mt-1 block text-faint">Detalhe: {message}</span>}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCw />
          Tentar novamente
        </Button>
      )}
    </Card>
  );
}
