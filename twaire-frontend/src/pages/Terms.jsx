import { Link } from "react-router-dom";
import Footer from "@/components/Footer.jsx";
import { useEffect } from "react";

function TermsSection({ title, children }) {
  return (
    <section className="mb-4">
      <h2 className="h6 fw-bold mb-2">{title}</h2>
      <p className="text-body-secondary mb-0" style={{ lineHeight: 1.8 }}>
        {children}
      </p>
    </section>
  );
}

function Terms() {
  useEffect(() => {
    document.title = "Terms and Conditions - Twaire";
  }, []);

  return (
    <>
      <div className="container py-4" style={{ maxWidth: 720 }}>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-sm-5">
          <h1 className="h3 fw-bold mb-2">
            Terms and Conditions
          </h1>
          <p className="text-body-secondary mb-4">
            These terms describe how Twaire may be used. If you do not agree, do not create an account or use the service.
          </p>

          <TermsSection title="Account Responsibility">
            You are responsible for the activity that occurs under your account, including content you upload, comments you
            post, and any actions taken while signed in.
          </TermsSection>

          <TermsSection title="Content">
            You should only upload or share content that you have the right to use. Do not upload illegal, abusive, or
            deceptive content.
          </TermsSection>

          <TermsSection title="Service Availability">
            Twaire is provided as-is during active development. Features may change, break, or be removed without notice.
          </TermsSection>

          <TermsSection title="Privacy and Security">
            Keep your login credentials private. Twaire is not responsible for unauthorized access caused by poor credential
            hygiene or shared devices.
          </TermsSection>

          <TermsSection title="Changes">
            We may update these terms at any time. Continued use of the service after changes means you accept the updated
            version.
          </TermsSection>

          <p className="text-body-secondary mt-4 mb-0">
            Questions about these terms? Return to the{" "}
            <Link to="/signup" className="fw-bold text-decoration-none">
              signup page
            </Link>
            .
          </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Terms;
