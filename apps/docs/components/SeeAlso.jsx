import Link from "next/link";

export function SeeAlso({ links }) {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="nx-my-6 nx-rounded-lg nx-border nx-border-blue-200 dark:nx-border-blue-900 nx-bg-blue-50 dark:nx-bg-blue-950/30 nx-p-4">
      <h4 className="nx-text-sm nx-font-semibold nx-text-blue-900 dark:nx-text-blue-100 nx-mb-3 nx-mt-0">
        See Also
      </h4>
      <ul className="nx-space-y-2 nx-m-0 nx-pl-0 nx-list-none">
        {links.map((link, index) => (
          <li key={index} className="nx-flex nx-items-center nx-gap-2">
            <svg
              className="nx-w-4 nx-h-4 nx-text-blue-600 dark:nx-text-blue-400 nx-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href={link.href}
              className="nx-text-sm nx-text-blue-700 dark:nx-text-blue-300 hover:nx-text-blue-900 dark:hover:nx-text-blue-100 hover:nx-underline"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
