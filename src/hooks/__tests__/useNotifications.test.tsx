import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNotifications } from '../useNotifications';
import * as AuthContext from '@/contexts/AuthContext';
import * as ToastHook from '@/hooks/use-toast';
import { createMockSupabaseClient } from '@/test/mocks/supabase';

const waitFor = async (callback: () => void, timeout = 1000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      callback();
      return;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  callback();
};

// Mock modules
vi.mock('@/integrations/supabase/client', () => ({
  supabase: null, // Will be set in tests
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

describe('useNotifications', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  const mockToast = vi.fn();
  let mockSupabase: any;
  let mockChannel: any;
  let mockFrom: any;

  beforeEach(() => {
    // Setup mocks
    const mocks = createMockSupabaseClient();
    mockSupabase = mocks.mockSupabase;
    mockChannel = mocks.mockChannel;
    mockFrom = mocks.mockFrom;

    // Set mock in module
    vi.doMock('@/integrations/supabase/client', () => ({
      supabase: mockSupabase,
    }));

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    } as any);

    vi.spyOn(ToastHook, 'useToast').mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should fetch notifications on mount when user is authenticated', async () => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        type: 'info',
        read: false,
        related_id: null,
        related_type: null,
        created_at: new Date().toISOString(),
      },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });
  });

  it('should not fetch notifications when user is null', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    } as any);

    renderHook(() => useNotifications());

    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should calculate unread count correctly', async () => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Notification 1',
        message: 'Message 1',
        type: 'info',
        read: false,
        related_id: null,
        related_type: null,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Notification 2',
        message: 'Message 2',
        type: 'info',
        read: true,
        related_id: null,
        related_type: null,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Notification 3',
        message: 'Message 3',
        type: 'info',
        read: false,
        related_id: null,
        related_type: null,
        created_at: new Date().toISOString(),
      },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });
  });

  it('should subscribe to realtime changes on mount', () => {
    renderHook(() => useNotifications());

    expect(mockSupabase.channel).toHaveBeenCalledWith('notifications-changes');
    expect(mockChannel.on).toHaveBeenCalled();
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should mark notification as read', async () => {
    const mockUpdate = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: mockEq,
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: mockUpdate,
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.markAsRead).toBeDefined();
    });

    await result.current.markAsRead('notification-id');

    expect(mockFrom).toHaveBeenCalledWith('notifications');
    expect(mockUpdate).toHaveBeenCalledWith({ read: true });
  });

  it('should mark all notifications as read', async () => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Test 1',
        message: 'Message 1',
        type: 'info',
        read: false,
        related_id: null,
        related_type: null,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Test 2',
        message: 'Message 2',
        type: 'info',
        read: false,
        related_id: null,
        related_type: null,
        created_at: new Date().toISOString(),
      },
    ];

    const mockUpdate = vi.fn().mockReturnThis();
    const mockIn = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
      update: mockUpdate,
      in: mockIn,
    });

    mockUpdate.mockReturnValue({
      in: mockIn,
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
    });

    await result.current.markAllAsRead();

    expect(mockUpdate).toHaveBeenCalledWith({ read: true });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'All notifications marked as read',
    });
  });

  it('should delete notification', async () => {
    const mockDelete = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: mockEq,
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: mockDelete,
    });

    mockDelete.mockReturnValue({
      eq: mockEq,
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.deleteNotification).toBeDefined();
    });

    await result.current.deleteNotification('notification-id');

    expect(mockFrom).toHaveBeenCalledWith('notifications');
    expect(mockDelete).toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Fetch failed') }),
    });

    renderHook(() => useNotifications());

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching notifications:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should cleanup subscription on unmount', () => {
    const { unmount } = renderHook(() => useNotifications());

    unmount();

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('should not mark all as read if no unread notifications', async () => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Test',
        message: 'Message',
        type: 'info',
        read: true,
        related_id: null,
        related_type: null,
        created_at: new Date().toISOString(),
      },
    ];

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
      update: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(0);
    });

    await result.current.markAllAsRead();

    expect(mockFrom).not.toHaveBeenCalledWith(expect.objectContaining({ update: expect.any(Function) }));
  });
});
