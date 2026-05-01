function SubscribeButton({ subscribed, subLoading, handleSubscribe }) {
  return (
    <button
      className={`btn btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 ${
        subscribed ? 'btn-secondary' : 'btn-danger'
      }`}
      onClick={handleSubscribe}
      disabled={subLoading}
      style={subscribed ? { backgroundColor: '#757575', borderColor: '#757575' } : {}}
    >
      {subLoading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {subscribed ? <i className="bi bi-bell-fill small"></i> : null}
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </>
      )}
    </button>
  );
}

export default SubscribeButton;