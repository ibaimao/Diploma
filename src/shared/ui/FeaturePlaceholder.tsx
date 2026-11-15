import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Sprout } from "lucide-react";

interface FeaturePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onBack: () => void;
}

export function FeaturePlaceholder({
  icon: Icon,
  title,
  description,
  onBack,
}: FeaturePlaceholderProps) {
  return (
    <section className="feature-placeholder" aria-labelledby="feature-title">
      <div className="placeholder-icon">
        <Icon size={38} strokeWidth={1.5} />
      </div>
      <span className="eyebrow">БУДУЩИЙ РАЗДЕЛ</span>
      <h2 id="feature-title">{title}</h2>
      <p>{description}</p>
      <div className="coming-soon">
        <Sprout size={17} /> Здесь скоро что-нибудь вырастет
      </div>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} /> К задачам дня
      </button>
    </section>
  );
}
