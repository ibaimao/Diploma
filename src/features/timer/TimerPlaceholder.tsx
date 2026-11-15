import { Clock3 } from "lucide-react";
import { FeaturePlaceholder } from "../../shared/ui/FeaturePlaceholder";

export function TimerPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <FeaturePlaceholder
      icon={Clock3}
      title="Время сосредоточиться"
      description="Здесь будет Pomodoro 25/5 и учёт фактического времени: начало, пауза, продолжение и завершение. Таймер пока не работает."
      onBack={onBack}
    />
  );
}
