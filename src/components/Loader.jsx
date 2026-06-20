import './Loader.css'

function Loader({ text = 'Loading...', fullScreen = false, brand = false }) {
  const wrapperClass = fullScreen ? 'loader-overlay' : 'loader-inline'

  return (
    <div className={wrapperClass}>
      {brand && (
        <div className="loader-brand">
          <div className="loader-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <span className="loader-brand-name">Murti Kala</span>
        </div>
      )}
      <div className="loader-spinner" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}

function ButtonLoader({ text = 'Please wait...' }) {
  return (
    <span className="btn-loader">
      <span className="loader-spinner white" />
      {text}
    </span>
  )
}

export { Loader, ButtonLoader }
export default Loader
