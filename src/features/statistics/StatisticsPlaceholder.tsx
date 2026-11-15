import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { FeaturePlaceholder } from "../../shared/ui/FeaturePlaceholder";

export function StatisticsPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <FeaturePlaceholder
      icon={ChartNoAxesColumnIncreasing}
      title="Каждый шаг имеет значение"
      description="Здесь появятся история работы, сравнение плана с фактом и подсказки по длительности похожих задач. Реальные данные пока не собираются."
      onBack={onBack}
    />
  );
}
