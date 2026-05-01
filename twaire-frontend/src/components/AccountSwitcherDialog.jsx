import UserAvatar from "./UserAvatar.jsx";

function AccountSwitcherDialog({
  open,
  onClose,
  accounts,
  currentUserId,
  switchingUserId,
  onSwitchAccount,
  onAddAccount,
}) {
  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header border-bottom-0 pt-4 px-4">
              <h5 className="modal-title fw-bold">Switch accounts</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body px-4">
              {accounts.length === 0 ? (
                <p className="text-muted">
                  No saved accounts on this browser yet. Log into another account to add it here.
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {accounts.map((account) => {
                    const isCurrent = account.userId === currentUserId;
                    const isSwitching = switchingUserId === account.userId;

                    return (
                      <button
                        key={account.userId}
                        onClick={() => onSwitchAccount(account)}
                        disabled={isCurrent || isSwitching}
                        className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 d-flex align-items-center py-2 px-3 ${isCurrent ? 'bg-light' : ''}`}
                      >
                        <UserAvatar user={account} size={42} className="me-3" />
                        <div className="flex-grow-1 text-start">
                          <div className="d-flex align-items-center">
                            <span className="fw-bold text-dark">{account.publicName}</span>
                            {account.verified && (
                              <i className="bi bi-patch-check-fill text-primary ms-1 small"></i>
                            )}
                          </div>
                          <div className="text-muted small">
                            @{account.username}{isCurrent ? " (Current)" : ""}
                          </div>
                        </div>
                        {isSwitching && (
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Switching...</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer border-top-0 pb-4 px-4 d-flex justify-content-between">
              <button className="btn btn-outline-primary rounded-pill px-3" onClick={onAddAccount}>
                <i className="bi bi-person-plus-fill me-2"></i>
                Add account
              </button>
              <button className="btn btn-light rounded-pill px-3" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountSwitcherDialog;
