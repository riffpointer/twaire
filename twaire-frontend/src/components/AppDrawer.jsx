import { useColorMode } from "../App.jsx";
import { NavLink } from "react-router-dom";

function AppDrawer({ navLinkPages, open, toggleDrawer }) {
	const { mode, toggleColorMode } = useColorMode();

	return (
		<>
			{/* Backdrop */}
			{open && (
				<div 
					className="offcanvas-backdrop fade show" 
					onClick={toggleDrawer(false)}
				></div>
			)}

			<div 
				className={`offcanvas offcanvas-start ${open ? 'show' : ''}`} 
				tabIndex="-1" 
				style={{ visibility: open ? 'visible' : 'hidden', width: '280px' }}
				aria-labelledby="offcanvasExampleLabel"
			>
				<div className="offcanvas-header border-bottom">
					<h5 className="offcanvas-title fw-bold" id="offcanvasExampleLabel">Twaire</h5>
					<button 
						type="button" 
						className="btn-close text-reset" 
						onClick={toggleDrawer(false)}
						aria-label="Close"
					></button>
				</div>
				<div className="offcanvas-body d-flex flex-column p-0">
					<div className="list-group list-group-flush flex-grow-1">
						{Object.entries(navLinkPages).map(([label, navLink]) => (
							<NavLink 
								key={label}
								to={navLink.path} 
								className={({ isActive }) => 
									`list-group-item list-group-item-action border-0 d-flex align-items-center py-3 px-4 ${isActive ? 'active' : ''}`
								}
								onClick={toggleDrawer(false)}
							>
								<span className="me-3 d-flex align-items-center" style={{ fontSize: '1.2rem' }}>
									{navLink.icon}
								</span>
								<span className="fw-medium">{label}</span>
							</NavLink>
						))}
					</div>

					<div className="mt-auto border-top p-3">
						<button 
							className="btn btn-link text-decoration-none text-reset w-100 d-flex align-items-center justify-content-between p-2"
							onClick={toggleColorMode}
						>
							<div className="d-flex align-items-center">
								<i className={`bi ${mode === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill'} me-3`} style={{ fontSize: '1.2rem' }}></i>
								<span className="fw-medium">Dark mode</span>
							</div>
							<div className="form-check form-switch m-0">
								<input 
									className="form-check-input" 
									type="checkbox" 
									role="switch" 
									checked={mode === "dark"} 
									readOnly 
									style={{ cursor: 'pointer' }}
								/>
							</div>
						</button>
						<div className="mt-3 px-2">
							<small className="text-muted">
								&copy; 2025{' '}
								<a 
									href="http://github.com/theonlyasdk" 
									className="text-reset text-decoration-none"
									target="_blank" 
									rel="noopener noreferrer"
								>
									theonlyasdk
								</a>
							</small>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default AppDrawer;