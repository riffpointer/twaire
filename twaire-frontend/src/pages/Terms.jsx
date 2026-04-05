import { Box, Container, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer.jsx";
import { useEffect } from "react";

function TermsSection({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
        {children}
      </Typography>
    </Box>
  );
}

function Terms() {
  useEffect(() => {
    document.title = "Terms and Conditions - Twaire";
  }, []);

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Terms and Conditions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            These terms describe how Twaire may be used. If you do not agree, do not create an account or use the service.
          </Typography>

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

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Questions about these terms? Return to the{" "}
            <Typography component={Link} to="/signup" variant="inherit" sx={{ fontWeight: 700 }}>
              signup page
            </Typography>
            .
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}

export default Terms;
