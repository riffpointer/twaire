import CircularProgress from "@mui/material/CircularProgress";

function Loading({ label = null }) {
    return (
        <>
            <div className="d-flex justify-content-center align-items-center w-100 h-100">
                <CircularProgress size="30px" /> &nbsp;
                {label ? <span className="ms-2">{label}</span> : null}
            </div>
        </>
    );
}

export default Loading;