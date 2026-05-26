import { apiRequest } from './http';

export type DocumentaryComment = {
  id: string;
  body: string;
  rating: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type DocumentaryPost = {
  id: string;
  slug: string;
  title: string;
  youtubeUrl: string;
  description: string | null;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  comments: DocumentaryComment[];
};

export function getDocumentaryPost(slug: string, anonymousId: string, token?: string) {
  return apiRequest<DocumentaryPost>(`/posts/${encodeURIComponent(slug)}`, {
    token,
    headers: {
      'X-AIForge-Anonymous-Id': anonymousId,
    },
  });
}

export function toggleDocumentaryLike(slug: string, anonymousId: string, token?: string) {
  return apiRequest<{ liked: boolean; likeCount: number }>(`/posts/${encodeURIComponent(slug)}/likes`, {
    method: 'POST',
    token,
    body: JSON.stringify({ anonymousId }),
  });
}

export function createDocumentaryComment(
  slug: string,
  payload: { body: string; rating: number },
  token: string,
) {
  return apiRequest<DocumentaryComment>(`/posts/${encodeURIComponent(slug)}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
