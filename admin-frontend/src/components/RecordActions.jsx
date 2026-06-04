export default function RecordActions({ onView, onDownload, viewLabel = 'View', downloadLabel = 'Download', viewAriaLabel, downloadAriaLabel }) {
  return (
    <div className="record-actions" onClick={(e) => e.stopPropagation()}>
      <button
        aria-label={viewAriaLabel || viewLabel}
        className="btn-ghost btn-sm record-action-btn"
        onClick={onView}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">visibility</span>
        {viewLabel}
      </button>
      <button
        aria-label={downloadAriaLabel || downloadLabel}
        className="btn-outline btn-sm record-action-btn"
        onClick={onDownload}
        type="button"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">download</span>
        {downloadLabel}
      </button>
    </div>
  )
}
