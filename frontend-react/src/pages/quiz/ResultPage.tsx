import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getQuizAttempt, type QuizAttemptResult } from '../../shared/api/quiz';

export function ResultPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [error, setError] = useState('');
  const missingAttemptError = attemptId ? '' : t('result.missing');

  useEffect(() => {
    document.title = `${t('result.title')} | AI Cinema Lab`;

    if (!attemptId) {
      return;
    }

    getQuizAttempt(attemptId)
      .then((data) => {
        setResult(data);
        setError('');
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : t('result.loadError'));
      });
  }, [attemptId, t]);

  const score = result?.scorePercent ?? 0;
  const averageScore = result?.averageScorePercent ?? 0;

  return (
    <section className="result-page">
      <h1 id="scoreText">{result ? `${score}%` : error || missingAttemptError ? t('common.noResult') : t('result.loading')}</h1>
      <div className="score-box">
        <p id="scoreMessage" className={missingAttemptError || error ? 'is-error' : undefined}>
          {missingAttemptError || error || getScoreMessage(score, t)}
        </p>
      </div>
      <p className="quote">{t('result.quote')}</p>
      {result ? (
        <section className="average-score" aria-label={t('result.averageAria', { count: result.attemptsCount, score: averageScore })}>
          <div className="average-score-header">
            <span>{t('result.average')}</span>
            <strong>{averageScore}%</strong>
          </div>
          <div className="average-score-track">
            <div className="average-score-fill" style={{ width: `${averageScore}%` }} />
          </div>
        </section>
      ) : null}
      <Link to="/quiz" className="theme-btn">
        {t('result.tryAgain')}
      </Link>
    </section>
  );
}

function getScoreMessage(score: number, t: (key: string) => string) {
  if (score >= 90) {
    return t('result.outstanding');
  }

  if (score >= 70) {
    return t('result.great');
  }

  if (score >= 50) {
    return t('result.good');
  }

  return t('result.low');
}
