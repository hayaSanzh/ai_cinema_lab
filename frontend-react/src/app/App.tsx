import { Route, Routes } from 'react-router-dom';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { GoogleOAuthCallbackPage } from '../pages/auth/GoogleOAuthCallbackPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AboutPage } from '../pages/content/AboutPage';
import { CasesPage } from '../pages/content/CasesPage';
import { HomePage } from '../pages/content/HomePage';
import { DocumentaryPage } from '../pages/documentary/DocumentaryPage';
import { HiggsfieldLessonsPage } from '../pages/higgsfield/HiggsfieldLessonsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { QuizPage } from '../pages/quiz/QuizPage';
import { ResultPage } from '../pages/quiz/ResultPage';
import { AppLayout } from '../widgets/layout/AppLayout';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/callback" element={<GoogleOAuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/documentary" element={<DocumentaryPage />} />
        <Route path="/learn-ai" element={<HiggsfieldLessonsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
