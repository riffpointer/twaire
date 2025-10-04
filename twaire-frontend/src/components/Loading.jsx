import CircularProgress from "@mui/material/CircularProgress";

function Loading({ label = null, show = true }) {
  if (show)
    return (
      <>
        <div className="d-flex justify-content-center align-items-center w-100 h-100">
          <CircularProgress size="30px" /> &nbsp;
          {label ? <span className="ms-2">{label}</span> : null}
        </div>
      </>
    );
  else return null;
}

export default Loading;
