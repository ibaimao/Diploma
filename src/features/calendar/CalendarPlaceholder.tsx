import { CalendarDays } from "lucide-react";
import { FeaturePlaceholder } from "../../shared/ui/FeaturePlaceholder";

export function CalendarPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <FeaturePlaceholder
      icon={CalendarDays}
      title="Место для твоих планов"
      description="Здесь появится недельный календарь на FullCalendar: занятия, свободное время и ручной перенос задач. Сейчас раздел не реализован."
      onBack={onBack}
    />
  );
}
