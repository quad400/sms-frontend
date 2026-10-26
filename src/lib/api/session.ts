import createClient from 'openapi-fetch';
import type { SessionUser } from '@/lib/auth/types';

export type SessionLoginBody = {
  identifier: string;
  password: string;
};

export type SessionLoginResponse =
  | { user: SessionUser }
  | { challenge: { challengeToken: string } };

type SessionPaths = {
  '/api/session/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': SessionLoginBody;
        };
      };
      responses: {
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': SessionLoginResponse;
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
};

/** Cookie session BFF — does not go through `/api/proxy`. */
export const sessionApi = createClient<SessionPaths>();
