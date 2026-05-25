INSERT INTO quiz_questions (id, slug, title, media_type, media_path, correct_answer, sort_order)
VALUES
  ('quiz-scene-1', 'scene-1', 'Scene 1', 'image', 'assets/img/quiz/1.jpg', 'ai', 1),
  ('quiz-scene-2', 'scene-2', 'Scene 2', 'image', 'assets/img/quiz/2.jpg', 'real', 2),
  ('quiz-scene-3', 'scene-3', 'Scene 3', 'image', 'assets/img/quiz/3.jpg', 'real', 3),
  ('quiz-scene-4', 'scene-4', 'Scene 4', 'image', 'assets/img/quiz/4.jpg', 'ai', 4),
  ('quiz-scene-5', 'scene-5', 'Scene 5', 'image', 'assets/img/quiz/5.jpg', 'ai', 5),
  ('quiz-scene-6', 'scene-6', 'Scene 6', 'video', 'assets/video/6.mp4', 'real', 6),
  ('quiz-scene-7', 'scene-7', 'Scene 7', 'video', 'assets/video/7.mp4', 'ai', 7),
  ('quiz-scene-8', 'scene-8', 'Scene 8', 'video', 'assets/video/8.mp4', 'real', 8),
  ('quiz-scene-9', 'scene-9', 'Scene 9', 'video', 'assets/video/9.mp4', 'real', 9),
  ('quiz-scene-10', 'scene-10', 'Scene 10', 'video', 'assets/video/10.mp4', 'ai', 10)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  media_type = EXCLUDED.media_type,
  media_path = EXCLUDED.media_path,
  correct_answer = EXCLUDED.correct_answer,
  sort_order = EXCLUDED.sort_order;
