import { Injectable, ServiceUnavailableException } from '@nestjs/common';

type GeminiRequest = {
  model: string;
  apiKey: string;
  payload: Record<string, unknown>;
};

export type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

@Injectable()
export class GeminiClient {
  async generate({ model, apiKey, payload }: GeminiRequest): Promise<GeminiResponse> {
    const endpoint = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    );
    endpoint.searchParams.set('key', apiKey);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as GeminiResponse;

    if (!response.ok) {
      throw new ServiceUnavailableException(
        body.error?.message ?? 'Gemini API request failed.',
      );
    }

    return body;
  }
}
