import { vi } from 'vitest';

export const createMockSupabaseClient = () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ error: null }),
  };

  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockResolvedValue({ error: null }),
    in: vi.fn().mockResolvedValue({ error: null }),
  }));

  const mockSupabase = {
    from: mockFrom,
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  };

  return { mockSupabase, mockChannel, mockFrom };
};
