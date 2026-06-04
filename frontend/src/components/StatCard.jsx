export default function StatCard({ label, value, testId }) {
  // Determine icon and theme based on label
  let iconName = 'monitoring'
  let iconContainerClass = 'bg-surface-container-low text-primary'

  const lowerLabel = (label || '').toLowerCase()
  if (lowerLabel.includes('case')) {
    iconName = 'support_agent'
  } else if (lowerLabel.includes('order')) {
    iconName = 'shopping_cart'
  } else if (lowerLabel.includes('invoice') || lowerLabel.includes('unpaid')) {
    iconName = 'receipt_long'
    iconContainerClass = 'bg-error-container text-on-error-container'
  }

  return (
    <div 
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col gap-sm shadow-sm hover:shadow-md transition-all"
      data-testid={testId}
    >
      <div className="flex justify-between items-center w-full" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconContainerClass}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined text-[20px]">{iconName}</span>
        </div>
      </div>
      <div className="font-headline-md text-headline-md text-on-surface font-bold mt-xs" style={{ fontSize: '24px' }}>{value}</div>
    </div>
  )
}
