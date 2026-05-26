import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createDocumentaryComment,
  getDocumentaryPost,
  toggleDocumentaryLike,
  type DocumentaryComment,
  type DocumentaryPost,
} from '../../shared/api/documentary';
import { useAuth } from '../../shared/auth/useAuth';
import { formatDateTime, getInitials } from '../../shared/lib/format';

const postSlug = 'documentary-film';
const anonymousIdKey = 'aiforge.anonymousId';

export function DocumentaryPage() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const anonymousId = useMemo(getAnonymousId, []);
  const [post, setPost] = useState<DocumentaryPost | null>(null);
  const [rating, setRating] = useState(5);
  const [commentBody, setCommentBody] = useState('');
  const [feedback, setFeedback] = useState(t('documentary.loading'));
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    document.title = t('documentary.pageTitle');
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, t]);

  async function loadPost() {
    try {
      const data = await getDocumentaryPost(postSlug, anonymousId, session?.token);

      setPost(data);
      setFeedback('');
      setFeedbackType('info');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t('documentary.loadError'));
      setFeedbackType('error');
    }
  }

  async function handleLike() {
    setIsBusy(true);

    try {
      const result = await toggleDocumentaryLike(postSlug, anonymousId, session?.token);

      setPost((currentPost) =>
        currentPost
          ? {
              ...currentPost,
              viewerHasLiked: result.liked,
              likeCount: result.likeCount,
            }
          : currentPost,
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t('documentary.likeError'));
      setFeedbackType('error');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      return;
    }

    setIsBusy(true);
    setFeedback(t('documentary.posting'));
    setFeedbackType('info');

    try {
      await createDocumentaryComment(postSlug, { body: commentBody.trim(), rating }, session.token);
      setCommentBody('');
      setRating(5);
      await loadPost();
      setFeedback(t('documentary.posted'));
      setFeedbackType('success');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t('documentary.postError'));
      setFeedbackType('error');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="documentary-page">
      <main className="documentary-shell">
        <section className="documentary-hero section-padding">
          <div className="container">
            <div className="documentary-content">
              <div className="documentary-heading">
                <p className="documentary-eyebrow">{t('documentary.eyebrow')}</p>
                <h1>{t('documentary.title')}</h1>
              </div>

              <div className="documentary-video">
                {post ? (
                  <iframe
                    title="Documentary film video"
                    src={toYoutubeEmbedUrl(post.youtubeUrl)}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : null}
              </div>

              <div className="documentary-actions">
                <p className="documentary-description">{t('documentary.description')}</p>
                <button
                  type="button"
                  className={`documentary-like${post?.viewerHasLiked ? ' is-liked' : ''}`}
                  aria-pressed={post?.viewerHasLiked ?? false}
                  onClick={handleLike}
                  disabled={isBusy}
                >
                  <i className={`${post?.viewerHasLiked ? 'fa-solid' : 'fa-regular'} fa-heart`} />
                  <span>{post?.viewerHasLiked ? t('documentary.liked') : t('documentary.like')}</span>
                  <strong>{post?.likeCount ?? 0}</strong>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="documentary-comments-section">
          <div className="container">
            <div className="documentary-comments-layout">
              <div className="comments-list-panel">
                <h2>
                  {t('documentary.comments')} (<span>{post?.commentCount ?? 0}</span>)
                </h2>
                <div className="comments-list">
                  {post?.comments.length ? (
                    post.comments.map((comment) => <CommentItem key={comment.id} comment={comment} language={i18n.language} />)
                  ) : (
                    <p className="comments-empty">{t('documentary.empty')}</p>
                  )}
                </div>
              </div>

              <aside className="comment-form-panel">
                <h3>{t('documentary.reviewTitle')}</h3>
                {session ? <p>{t('documentary.reviewHint')}</p> : null}
                <form className={`comment-form${session ? '' : ' is-disabled'}`} onSubmit={handleCommentSubmit}>
                  <div className="rating-picker" aria-label={t('documentary.rating')}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={value <= rating ? 'is-active' : undefined}
                        disabled={!session}
                        aria-label={t('documentary.stars', { count: value })}
                        onClick={() => setRating(value)}
                      >
                        <i className="fa-solid fa-star" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    placeholder={t('documentary.placeholder')}
                    maxLength={1200}
                    minLength={3}
                    disabled={!session}
                    required
                  />
                  <button type="submit" className="theme-btn" disabled={!session || isBusy}>
                    {t('documentary.submit')} <i className="fa-sharp fa-regular fa-arrow-up-right" />
                  </button>
                </form>
                <p className={`documentary-feedback is-${feedbackType}`} aria-live="polite">
                  {feedback}
                </p>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}

function CommentItem({ comment, language }: { comment: DocumentaryComment; language: string }) {
  return (
    <article className="comment-item">
      <div className="comment-avatar">
        {comment.author.avatarUrl ? <img src={comment.author.avatarUrl} alt="" /> : getInitials(comment.author.name)}
      </div>
      <div>
        <div className="comment-meta">
          <div>
            <h3 className="comment-author">{comment.author.name}</h3>
            <p className="comment-date">{formatDateTime(comment.createdAt, language)}</p>
          </div>
          <div className="comment-stars">{'★'.repeat(comment.rating)}</div>
        </div>
        <p className="comment-body">{comment.body}</p>
      </div>
    </article>
  );
}

function getAnonymousId() {
  let anonymousId = localStorage.getItem(anonymousIdKey);

  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem(anonymousIdKey, anonymousId);
  }

  return anonymousId;
}

function toYoutubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.hostname.includes('youtu.be')
      ? parsedUrl.pathname.slice(1)
      : parsedUrl.searchParams.get('v');

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch {
    return url;
  }
}
