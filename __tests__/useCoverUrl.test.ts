import { renderHook, waitFor, act } from "@testing-library/react";
import { useCoverUrl } from "@/lib/useCoverUrl";

const ISBN = "9788845292613";
const COVER_URL = `https://covers.openlibrary.org/b/isbn/${ISBN}-L.jpg`;

function mockFetch(
  status: number,
  contentType: string | null,
  opts: { reject?: boolean; hang?: boolean } = {}
) {
  if (opts.hang) {
    global.fetch = jest.fn(() => new Promise(() => {}));
    return;
  }
  if (opts.reject) {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));
    return;
  }
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (h: string) => (h === "content-type" ? contentType : null) },
    } as unknown as Response)
  );
}

beforeEach(() => jest.resetAllMocks());
afterEach(() => jest.useRealTimers());

// Cycle 7 — timeout
test("resolves to error after 3-second timeout", async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn((_url, opts: RequestInit = {}) =>
    new Promise((_, reject) => {
      opts?.signal?.addEventListener("abort", () =>
        reject(new DOMException("The operation was aborted.", "AbortError"))
      );
    })
  );
  const { result } = renderHook(() => useCoverUrl(ISBN));
  expect(result.current.status).toBe("loading");
  await act(async () => { jest.advanceTimersByTime(3001); });
  jest.useRealTimers();
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.url).toBeNull();
});

// Cycle 3 — empty isbn
test("resolves to error immediately without fetching when isbn is empty", async () => {
  global.fetch = jest.fn();
  const { result } = renderHook(() => useCoverUrl(""));
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.url).toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
});

// Cycle 4 — 404
test("resolves to error when HEAD returns 404", async () => {
  mockFetch(404, null);
  const { result } = renderHook(() => useCoverUrl(ISBN));
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.url).toBeNull();
});

// Cycle 5 — non-image content-type
test("resolves to error when HEAD returns 200 but content-type is not image", async () => {
  mockFetch(200, "text/html");
  const { result } = renderHook(() => useCoverUrl(ISBN));
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.url).toBeNull();
});

// Cycle 6 — network error
test("resolves to error on network failure", async () => {
  mockFetch(0, null, { reject: true });
  const { result } = renderHook(() => useCoverUrl(ISBN));
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.url).toBeNull();
});

// Cycle 2 — ready
test("resolves to ready with Open Library URL on 200 + image content-type", async () => {
  mockFetch(200, "image/jpeg");
  const { result } = renderHook(() => useCoverUrl(ISBN));
  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(result.current.url).toBe(COVER_URL);
});

// Cycle 1 — starts in loading
test("starts in loading while fetch is in flight", () => {
  mockFetch(200, "image/jpeg", { hang: true });
  const { result } = renderHook(() => useCoverUrl(ISBN));
  expect(result.current.status).toBe("loading");
  expect(result.current.url).toBeNull();
});
