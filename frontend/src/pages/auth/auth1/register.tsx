// project-imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthRegister from 'sections/auth/auth-forms/AuthRegister';

// ================================|| REGISTER ||================================ //

export default function Register() {
  return (
    <AuthWrapper>
      <AuthRegister />
    </AuthWrapper>
  );
}
