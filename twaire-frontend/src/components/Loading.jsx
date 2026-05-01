function Loading({ label = null, show = true, size = "1.5rem" }) {
  if (show)
    return (
      <div className="d-flex justify-content-center align-items-center w-100 h-100">
        <div 
          className="spinner-border text-primary" 
          role="status" 
          style={{ width: size, height: size, borderWidth: '0.2em' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        {label ? <span className="ms-2">{label}</span> : null}
      </div>
    );
  else return null;
}

export default Loading;
