import Link from "next/link";

const priorityConfig = {
  P0: {
    label: "P0",
    bg: "nx-bg-red-100 dark:nx-bg-red-900/30",
    text: "nx-text-red-800 dark:nx-text-red-200",
    border: "nx-border-red-200 dark:nx-border-red-800",
  },
  P1: {
    label: "P1",
    bg: "nx-bg-orange-100 dark:nx-bg-orange-900/30",
    text: "nx-text-orange-800 dark:nx-text-orange-200",
    border: "nx-border-orange-200 dark:nx-border-orange-800",
  },
  P2: {
    label: "P2",
    bg: "nx-bg-blue-100 dark:nx-bg-blue-900/30",
    text: "nx-text-blue-800 dark:nx-text-blue-200",
    border: "nx-border-blue-200 dark:nx-border-blue-800",
  },
  P3: {
    label: "P3",
    bg: "nx-bg-gray-100 dark:nx-bg-gray-900/30",
    text: "nx-text-gray-800 dark:nx-text-gray-200",
    border: "nx-border-gray-200 dark:nx-border-gray-800",
  },
};

export function PackageCard({ name, description, priority = "P2", href }) {
  const config = priorityConfig[priority] || priorityConfig.P2;

  return (
    <Link
      href={href}
      className="nx-block nx-group nx-rounded-lg nx-border nx-border-gray-200 dark:nx-border-gray-800 nx-bg-white dark:nx-bg-gray-950 nx-p-5 nx-transition-all hover:nx-border-gray-300 dark:hover:nx-border-gray-700 hover:nx-shadow-md nx-no-underline"
    >
      <div className="nx-flex nx-items-start nx-justify-between nx-gap-3 nx-mb-2">
        <h3 className="nx-text-lg nx-font-semibold nx-text-gray-900 dark:nx-text-gray-100 nx-m-0 group-hover:nx-text-blue-600 dark:group-hover:nx-text-blue-400 nx-transition-colors">
          {name}
        </h3>
        <span
          className={`nx-inline-flex nx-items-center nx-px-2 nx-py-0.5 nx-rounded-md nx-text-xs nx-font-medium nx-border ${config.bg} ${config.text} ${config.border} nx-shrink-0`}
        >
          {config.label}
        </span>
      </div>
      <p className="nx-text-sm nx-text-gray-600 dark:nx-text-gray-400 nx-m-0">
        {description}
      </p>
    </Link>
  );
}
