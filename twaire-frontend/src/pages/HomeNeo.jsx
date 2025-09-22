import { Autocomplete, Button, Card, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import ApiConfig from "../utils/ApiConfig";

/**
 * The new Twaire homepage
 */
function HomeNeo() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [acOptions, setAcOptions] = useState([]);
  const [error, setError] = useState("");
  const [acLoading, setAcLoading] = useState(false); // Ac meaning autocomplete
  const [open, setOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    document.title = `Twaire - An open video platform`;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  
  useEffect(() => {
    fetchOptions();
  }, [searchTerm]);

  const handleLogout = async () => {
    try {
      await fetch(`${ApiConfig.serverUrl}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAcOptions([]);
  };

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      fetchOptions();
    })();
  };

  const anchorHandleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const anchorHandleClose = () => {
    setAnchorEl(null);
  };

  const fetchOptions = async () => {
    try {
      setAcLoading(true);
      if (acOptions.length > 0) return;

      const ac_options_res = await fetch(`${ApiConfig.serverUrl}/api/videos/search/autocomplete?q=${searchTerm}`);
      if (!ac_options_res.ok) {
        const errorData = await ac_options_res.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to retrieve autocomplete data");
      }

      const options_data = await ac_options_res.json();
      setAcOptions(options_data);
    } catch (err) {
      setError(err);
      console.log(err);
    } finally {
      setAcLoading(false);
    }
  };

  const links = {
    "All Videos": "/home",
    "Trending": "/trending",
    "My Profile": "/myaccount"
  };

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <div className="d-flex text-center flex-fill align-items-center justify-content-center flex-column">
          <div className="p-1">
            <h1 className="mb-2 gabarito text-very-big">
              Twaire
            </h1>
            <form onSubmit={handleSearch}>
              <Stack direction="row" spacing={2}>
                <Autocomplete
                  inputValue={searchTerm}
                  onInputChange={(event, newValue) => {
                    if (newValue == null) newValue = "";
                    setSearchTerm(newValue);
                  }}
                  value={searchTerm}
                  onChange={(event, newValue) => {
                    if (newValue == null) newValue = "";
                    setSearchTerm(newValue);
                  }}
                  disablePortal
                  sx={{ width: 300 }}
                  open={open}
                  onOpen={handleOpen}
                  onClose={handleClose}
                  options={acOptions}
                  loading={acLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="id"
                      label="Search videos"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <Fragment>
                              {acLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </Fragment>
                          ),
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option, { inputValue }) => {
                    const { key, ...optionProps } = props;
                    const matches = match(option, inputValue, { insideWords: true });
                    const parts = parse(option, matches);
        
                    return (
                      <li key={key} {...optionProps}>
                        <div>
                          {parts.map((part, index) => (
                            <span
                              key={index}
                              style={{ fontWeight: part.highlight ? 700 : 400 }}
                            >
                              {part.text}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  }}
                />
                <Button variant="contained" title="Search" type="submit">
                  <i className="bi bi-search"></i>
                </Button>
              </Stack>
            </form>
            <Card className="p-2 shadow-sm mt-2 mb-4 d-flex flex-row align-items-center justify-content-center">
              {Object.keys(links).map((key, index, arr) => (
                <div key={key}>
                  <Link to={links[key]} style={{ textDecoration: 'none' }}>
                    <Typography variant="button" color="primary">
                      {key}
                    </Typography>
                  </Link>
                  {index < arr.length - 1 && <span>&nbsp;&bull;&nbsp;</span>}
                </div>
              ))}
            </Card>
          </div>
          {user && (
            <div className="me-2 mb-2 shadow-sm bottom-0 end-0 position-absolute d-flex flex-row gap-2 align-items-center justify-content-center">
              <UserDropdown user={user} handleLogout={handleLogout} textWhite={false} hasOutline={true} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HomeNeo;