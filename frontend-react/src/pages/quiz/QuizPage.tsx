import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getQuizQuestions, submitQuizAttempt, type QuizQuestion } from '../../shared/api/quiz';
import { useAuth } from '../../shared/auth/useAuth';
import { getAssetUrl } from '../../shared/lib/asset-url';

type Answer = 'ai' | 'real';
type FeedbackType = 'error' | 'info';

export function QuizPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [feedback, setFeedback] = useState(t('quiz.loading'));
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = `${t('quiz.title')} | AI Cinema Lab`;
    getQuizQuestions()
      .then((data) => {
        setQuestions(data);
        setFeedback('');
      })
      .catch((error) => {
        setFeedback(error instanceof Error ? error.message : t('quiz.loadError'));
        setFeedbackType('error');
      });
  }, [t]);

  async function handleSubmit() {
    const missingQuestionIndex = questions.findIndex((question) => !answers[question.slug]);

    if (missingQuestionIndex !== -1) {
      setFeedback(t('quiz.missingAnswer', { number: missingQuestionIndex + 1 }));
      setFeedbackType('error');
      return;
    }

    setIsSubmitting(true);
    setFeedback(t('quiz.checkingResult'));
    setFeedbackType('info');

    try {
      const result = await submitQuizAttempt(
        questions.map((question) => ({
          slug: question.slug,
          selectedAnswer: answers[question.slug],
        })),
        session?.token,
      );

      navigate(`/result?attempt=${encodeURIComponent(result.attemptId)}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t('quiz.submitError'));
      setFeedbackType('error');
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="hero-secton hero-3 bg-cover" style={{ backgroundImage: "url('/assets/img/hero/hero-bg-3.png')" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="hero-content">
                <h1 className="wow fadeInUp" data-wow-delay=".3s">
                  <span className="highlight">
                    <b>{t('quiz.heroTitleBefore')}</b>
                  </span>{' '}
                  {t('quiz.heroTitleMiddle')}{' '}
                  <span className="highlight">
                    <b>{t('quiz.heroTitleAfter')}</b>
                  </span>
                </h1>
                <p className="wow fadeInUp" data-wow-delay=".5s">{t('quiz.heroText')}</p>
              </div>
            </div>
          </div>
          <div className="hero-image-items">
            <div className="hero-image style-2 wow fadeInUp" data-wow-delay=".3s">
              <img src="/assets/img/hero/02.jpg" alt="AI or real scene" />
            </div>
            <div className="hero-image wow fadeInUp" data-wow-delay=".5s">
              <img src="/assets/img/hero/03.jpg" alt="AI or real scene" />
            </div>
            <div className="hero-image style-3 wow fadeInUp" data-wow-delay=".7s">
              <img src="/assets/img/hero/04.jpg" alt="AI or real scene" />
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-section fix section-padding pt-0 margin-bottom-8 margin-top-5">
        <div className="mycustom-marque">
          <div className="scrolling-wrap gap-100">
            {[0, 1, 2].map((item) => (
              <div className="comm" key={item}>
                <div className="cmn-textslide textitalick text-custom-storke">AI</div>
                <img src="/assets/img/has-2.png" alt="" />
                <div className="cmn-textslide textitalick text-custom-storke">OR</div>
                <img src="/assets/img/has-2.png" alt="" />
                <div className="cmn-textslide textitalick text-custom-storke">REAL</div>
                <img src="/assets/img/has-2.png" alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="project-secton fix section-padding-2 pt-0">
        <div className="container">
          {questions.map((question, index) => (
            <QuestionRow
              key={question.id}
              question={question}
              index={index}
              sceneLabel={t('quiz.scene', { number: index + 1 })}
              realLabel={t('quiz.real')}
              selectedAnswer={answers[question.slug]}
              onSelect={(answer) => {
                setAnswers((current) => ({ ...current, [question.slug]: answer }));
                setFeedback('');
              }}
            />
          ))}

          <div className="text-center mt-5">
            <button id="checkAnswers" className="theme-btn" type="button" onClick={handleSubmit} disabled={isSubmitting || questions.length === 0}>
              {isSubmitting ? t('quiz.checking') : t('quiz.checkAnswers')}
            </button>
            <p id="quizFeedback" className={`quiz-feedback${feedbackType ? ` is-${feedbackType}` : ''}`} aria-live="polite">
              {feedback}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function QuestionRow({
  question,
  index,
  sceneLabel,
  realLabel,
  selectedAnswer,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  sceneLabel: string;
  realLabel: string;
  selectedAnswer?: Answer;
  onSelect: (answer: Answer) => void;
}) {
  const isEvenRow = index % 2 === 1;

  return (
    <div className="row g-5 align-items-center mb-5">
      <div className={`col-lg-6${isEvenRow ? ' order-lg-2' : ''}`}>
        <div className={`project-box-image ${isEvenRow ? 'img-custom-anim-right' : 'img-custom-anim-left'}`}>
          {question.mediaType === 'video' ? (
            <video src={getAssetUrl(question.mediaPath)} controls className="quiz-media" />
          ) : (
            <img src={getAssetUrl(question.mediaPath)} alt="AI or Real" className="quiz-media" loading="lazy" />
          )}
        </div>
      </div>
      <div className={`col-lg-6${isEvenRow ? ' order-lg-1' : ''}`}>
        <div className="project-box-content">
          <h2>{sceneLabel || question.title}</h2>
          <div className="quiz-options">
            <button
              type="button"
              className={`theme-btn quiz-btn${selectedAnswer === 'ai' ? ' selected' : ''}`}
              data-answer="ai"
              onClick={() => onSelect('ai')}
            >
              AI
            </button>
            <button
              type="button"
              className={`theme-btn border-btn quiz-btn${selectedAnswer === 'real' ? ' selected' : ''}`}
              data-answer="real"
              onClick={() => onSelect('real')}
            >
              {realLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
