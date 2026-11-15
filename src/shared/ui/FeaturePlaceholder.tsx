interface FeaturePlaceholderProps {
  title: string;
  description: string;
}

export function FeaturePlaceholder({
  title,
  description,
}: FeaturePlaceholderProps) {
  return (
    <section className="tasks-content" aria-labelledby="feature-title">
      <div className="panel-heading">
        <h1 id="feature-title">{title}</h1>
      </div>
      <div className="tasks-paper feature-placeholder" aria-label={description}>
        <p className="sr-only">{description}</p>
      </div>
    </section>
  );
}
