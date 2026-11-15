import { House } from "lucide-react";
import { FeaturePlaceholder } from "../../shared/ui/FeaturePlaceholder";

export function PetDetailsPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <FeaturePlaceholder
      icon={House}
      title="Дом для маленького друга"
      description="Плюша пока живёт на иллюстрации. Позже здесь появятся 3D-питомец из Blender, анимации, обустройство комнаты и аксессуары. Наград и покупок пока нет."
      onBack={onBack}
    />
  );
}
