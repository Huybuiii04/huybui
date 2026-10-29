/**
 * Khai báo tối thiểu cho API của Deno, dùng khi typecheck các Edge Function bằng `tsc`.
 * Bản thân Edge Runtime không cần file này.
 */
declare namespace Deno {
  export interface ServeHandler {
    (request: Request): Response | Promise<Response>;
  }

  export function serve(handler: ServeHandler): { finished: Promise<void> };
}
