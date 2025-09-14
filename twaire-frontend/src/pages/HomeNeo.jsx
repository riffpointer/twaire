import { Typography } from "@mui/material";
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

/**
 * The new Twaire homepage
 */
function HomeNeo() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <>
            <div className="d-flex flex-column min-vh-100">
                <div className="d-flex text-center w-100 align-items-center justify-content-center flex-column">
                    <Typography variant="h1" className="mb-2">
                        Twaire
                    </Typography>
                    <form
                        style={{ width: '40%' }}
                        onSubmit={handleSearch}
                    >
                        <div className="input-group shadow-sm">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search videos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search videos"
                            />
                            <button
                                className="btn btn-light"
                                type="button"
                                title="Search"
                            >
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
                <div className="container mt-4">
                </div>
            </div>
        </>
    )
}

export default HomeNeo;