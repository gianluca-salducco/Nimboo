export const useRouter = jest.fn(() => ({ push: jest.fn() }));
export const useSearchParams = jest.fn(() => new URLSearchParams());
export const usePathname = jest.fn(() => "/");
