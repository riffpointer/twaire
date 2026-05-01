function Footer() {
    return (
        <footer className="mt-auto px-3 py-1 w-100">
            <hr className="my-4 text-muted opacity-25" />
            <div className="text-center mb-5">
                <small className="text-muted">
                    &copy; 2025{' '}
                    <a 
                        href="http://github.com/theonlyasdk" 
                        className="text-reset text-decoration-none fw-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        theonlyasdk
                    </a>
                </small>
            </div>
        </footer>
    );
}

export default Footer;