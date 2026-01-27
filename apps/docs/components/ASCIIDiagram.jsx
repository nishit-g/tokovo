export function ASCIIDiagram({ children, title }) {
  return (
    <figure className="nx-my-6">
      {title && (
        <figcaption className="nx-text-sm nx-font-medium nx-text-gray-900 dark:nx-text-gray-100 nx-mb-2">
          {title}
        </figcaption>
      )}
      <pre className="nx-overflow-x-auto nx-rounded-lg nx-border nx-border-gray-200 dark:nx-border-gray-800 nx-bg-gray-50 dark:nx-bg-gray-900 nx-p-4">
        <code className="nx-font-mono nx-text-sm nx-text-gray-800 dark:nx-text-gray-200 nx-whitespace-pre">
          {children}
        </code>
      </pre>
    </figure>
  );
}
