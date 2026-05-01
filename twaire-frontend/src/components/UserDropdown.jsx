import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import AccountSwitcherDialog from './AccountSwitcherDialog.jsx';
import UserAvatar from './UserAvatar.jsx';

const UserDropdown = ({
  user,
  handleLogout,
  savedAccounts = [],
  switchingUserId = null,
  handleSwitchAccount,
  handleAddAccount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switcherDialogOpen, setSwitcherDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setLogoutDialogOpen(true);
  };

  const handleOpenSwitcher = () => {
    setDropdownOpen(false);
    setSwitcherDialogOpen(true);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn btn-link p-0 border-0 shadow-none d-flex align-items-center"
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <UserAvatar user={user} />
      </button>

      <div className={`dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2 ${dropdownOpen ? 'show' : ''}`} style={{ minWidth: '280px' }}>
        <div className="px-3 py-3 d-flex align-items-center">
          <UserAvatar user={user} size={48} className="me-3" />
          <div className="overflow-hidden">
            <h6 className="mb-0 fw-bold text-truncate">{user.publicName}</h6>
            <div className="text-muted small text-truncate">@{user.username}</div>
          </div>
        </div>
        
        <div className="dropdown-divider mx-2"></div>
        
        <NavLink to="/myaccount" className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 mx-1" onClick={() => setDropdownOpen(false)}>
          <i className="bi bi-person-circle me-3"></i>
          My Profile
        </NavLink>
        <NavLink to="/editprofile" className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 mx-1" onClick={() => setDropdownOpen(false)}>
          <i className="bi bi-person-gear me-3"></i>
          Edit Profile
        </NavLink>
        <NavLink to="/dashboard" className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 mx-1" onClick={() => setDropdownOpen(false)}>
          <i className="bi bi-speedometer2 me-3"></i>
          Dashboard
        </NavLink>
        
        <div className="dropdown-divider mx-2"></div>
        
        <button className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 mx-1" onClick={handleOpenSwitcher}>
          <i className="bi bi-person-lines-fill me-3"></i>
          Switch accounts
        </button>
        <button className="dropdown-item d-flex align-items-center py-2 px-3 rounded-2 mx-1 text-danger" onClick={handleLogoutClick}>
          <i className="bi bi-box-arrow-right me-3"></i>
          Logout
        </button>
      </div>

      <AccountSwitcherDialog
        open={switcherDialogOpen}
        onClose={() => setSwitcherDialogOpen(false)}
        accounts={savedAccounts}
        currentUserId={user?._id}
        switchingUserId={switchingUserId}
        onSwitchAccount={async (account) => {
          await handleSwitchAccount(account);
          setSwitcherDialogOpen(false);
        }}
        onAddAccount={() => {
          setSwitcherDialogOpen(false);
          handleAddAccount();
        }}
      />

      {logoutDialogOpen && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setLogoutDialogOpen(false)}></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Logout?</h5>
                  <button type="button" className="btn-close" onClick={() => setLogoutDialogOpen(false)}></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to log out?
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button className="btn btn-light rounded-pill px-3" onClick={() => setLogoutDialogOpen(false)}>Cancel</button>
                  <button className="btn btn-danger rounded-pill px-3" onClick={() => {
                    setLogoutDialogOpen(false);
                    handleLogout();
                  }}>Logout</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDropdown;
