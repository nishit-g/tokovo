import clsx from 'clsx'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx('font-medium tracking-tight text-white', className)}>
      tokovo<span className="text-gray-500">.</span><span className="text-gray-600">studio</span>
    </span>
  )
}
