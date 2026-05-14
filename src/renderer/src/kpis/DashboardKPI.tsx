type DashboardKPIProps = {
  title: string
  text: string
  mainIcon: string
  info: string
  infoIcon: string
}

export const DashboardKPI = ({
  title,
  text,
  mainIcon,
  info,
  infoIcon
}: DashboardKPIProps): React.JSX.Element => {
  return (
    <div className="bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
      <div className="flex justify-between items-start mb-stack-sm">
        <span className="font-label-caps text-label-caps text-on-surface-variant">{title}</span>
        <span className="material-symbols-outlined text-primary opacity-50">{mainIcon}</span>
      </div>
      <div className="font-data-display text-data-display text-primary font-bold">{text}</div>
      {/* <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
        <span className="material-symbols-outlined text-xs">{infoIcon}</span>
        <span>{info}</span>
      </div> */}
    </div>
  )
}
