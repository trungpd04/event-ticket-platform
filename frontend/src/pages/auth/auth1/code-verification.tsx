// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthCodeVerification from 'sections/auth/auth-forms/AuthCodeVerification';

// ================================|| CODE VERIFICATION ||================================ //

export default function CodeVerification() {
  return (
    <AuthWrapper>
      <AuthCodeVerification />
    </AuthWrapper>
  );
}
