const ApiConfig = {
    serverUrl:
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:5000"
            : `http://${window.location.hostname}:5000`,
};


export default ApiConfig;
