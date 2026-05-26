import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProfile, updateProfile, uploadAvatar, type PublicProfile } from '../../shared/api/profile';
import { useAuth } from '../../shared/auth/useAuth';
import { prepareAvatarFile } from '../../shared/lib/avatar';
import { getInitials } from '../../shared/lib/format';

type FeedbackType = 'success' | 'error' | 'info';

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session, updateUser, signOut } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(t('profile.loading'));
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }

    let isMounted = true;

    getProfile(session.token)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setProfile(data);
        setName(data.name);
        updateUser(data);
        setFeedback('');
        setFeedbackType('info');
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setFeedback(error instanceof Error ? error.message : t('profile.loadError'));
        setFeedbackType('error');
      });

    return () => {
      isMounted = false;
    };
  }, [session, t, updateUser]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const visibleAvatarUrl = useMemo(
    () => avatarPreview ?? profile?.avatarUrl ?? null,
    [avatarPreview, profile?.avatarUrl],
  );

  useEffect(() => {
    document.title = `${t('profile.title')} | AI Cinema Lab`;
  }, [t]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  async function handleAvatarChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setFeedback(t('profile.preparingAvatar'));
    setFeedbackType('info');

    try {
      const preparedFile = await prepareAvatarFile(file);
      const previewUrl = URL.createObjectURL(preparedFile);

      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }

      setAvatarFile(preparedFile);
      setAvatarPreview(previewUrl);
      setFeedback(t('profile.avatarReady'));
      setFeedbackType('info');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t('profile.avatarError'));
      setFeedbackType('error');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      return;
    }

    setIsSaving(true);
    setFeedback(t('profile.saving'));
    setFeedbackType('info');

    try {
      if (avatarFile) {
        await uploadAvatar(session.token, avatarFile);
      }

      const nextProfile = await updateProfile(session.token, name.trim());

      setProfile(nextProfile);
      updateUser(nextProfile);
      setAvatarFile(null);
      setFeedback(t('profile.saved'));
      setFeedbackType('success');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t('profile.saveError'));
      setFeedbackType('error');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <section className="login-section section-padding fix bg-cover" style={{ backgroundImage: "url('/assets/img/service/Pattern.png')" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <div className="login-wrapper profile-card">
              <div className="row justify-content-center">
                <div className="col-12">
                  <div className="signin-item">
                    <div className="sign-header">
                      <h3>{t('profile.title')}</h3>
                      <p>{t('profile.subtitle')}</p>
                    </div>

                    <form action="#" className="mt-4" onSubmit={handleSubmit}>
                      <div className="profile-avatar-control">
                        <div className="profile-avatar-preview">
                          {visibleAvatarUrl ? <img src={visibleAvatarUrl} alt="" /> : getInitials(name || profile?.email || 'AI')}
                        </div>
                        <div className="profile-avatar-actions">
                          <label className="profile-avatar-button" htmlFor="profileAvatar">
                            <i className="fa-regular fa-image" />
                            {t('profile.upload')}
                          </label>
                          <input
                            id="profileAvatar"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(event) => handleAvatarChange(event.target.files?.[0])}
                          />
                          <p className="profile-avatar-hint">{t('profile.avatarHint')}</p>
                        </div>
                      </div>

                      <div className="input-item">
                        <span className="lable-text">{t('auth.name')}</span>
                        <input
                          type="text"
                          name="name"
                          placeholder={t('auth.name')}
                          autoComplete="name"
                          minLength={2}
                          maxLength={120}
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                        />
                        <div className="icon">
                          <i className="fa-regular fa-user" />
                        </div>
                      </div>
                      <div className="input-item">
                        <span className="lable-text">{t('auth.email')}</span>
                        <input type="email" autoComplete="email" value={profile?.email ?? session.user.email} readOnly />
                        <div className="icon">
                          <i className="fa-regular fa-envelope" />
                        </div>
                      </div>

                      <div className="profile-actions">
                        <button type="submit" className="theme-btn" disabled={isSaving}>
                          {t('profile.save')} <i className="fa-sharp fa-regular fa-arrow-up-right" />
                        </button>
                        <button type="button" className="profile-sign-out" onClick={handleSignOut}>
                          <i className="fa-regular fa-arrow-right-from-bracket" />
                          {t('profile.signOut')}
                        </button>
                      </div>
                      <p className={`profile-feedback is-${feedbackType}`} aria-live="polite">
                        {feedback}
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
