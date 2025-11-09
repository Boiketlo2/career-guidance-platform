import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../../api/authAPI";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const uid = searchParams.get("uid");

  useEffect(() => {
    if (uid) verifyEmail(uid);
    else {
      setStatus("error");
      setMessage("Invalid verification link. No user ID provided.");
    }
  }, [uid]);

  const verifyEmail = async (userId) => {
    try {
      setLoading(true);
      const res = await authAPI.verifyEmail(userId);

      if (res.success) {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setStatus("error");
        setMessage(res.error || "Failed to verify email. Please try again.");
      }
    } catch (err) {
      console.error("Email verification error:", err);
      setStatus("error");
      setMessage("An error occurred during verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!uid) return setMessage("Cannot resend verification. No user ID provided.");

    try {
      setResendLoading(true);
      // Backend uses the same endpoint for resending
      const res = await authAPI.verifyEmail(uid);

      if (res.success) setMessage("Verification email sent! Check your inbox.");
      else setMessage(res.error || "Failed to resend verification email.");
    } catch (err) {
      console.error("Resend verification error:", err);
      setMessage("Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div>
            <h2>⏳ Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
            {loading && <p>Verifying...</p>}
          </div>
        );

      case "success":
        return (
          <div>
            <h2>✅ Email Verified!</h2>
            <p>{message}</p>
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        );

      case "error":
        return (
          <div>
            <h2>❌ Verification Failed</h2>
            <p>{message}</p>
            {uid && (
              <button onClick={handleResendVerification} disabled={resendLoading}>
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
            )}
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, margin: "50px auto" }}>
      {renderContent()}
    </div>
  );
};

export default EmailVerification;
