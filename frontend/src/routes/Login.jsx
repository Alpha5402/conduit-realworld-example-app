import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthPageContainer from "../components/AuthPageContainer";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [errorMessage, setErrorMessage] = useState();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleError = (error) => {
    setErrorMessage(error);
  };

  const handleLoginSuccess = () => {
    navigate("/");
  };

  return (
    <AuthPageContainer
      error={errorMessage}
      path="/register"
      text="Need an account?"
      title="Sign in"
    >
      <LoginForm onError={handleError} onSuccess={handleLoginSuccess} login={login} />
    </AuthPageContainer>
  );
}

export default Login;