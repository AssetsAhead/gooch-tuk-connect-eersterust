-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.notifications IS 'In-app notifications for users. Supports real-time updates.';

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (used by triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for role_requests table
ALTER TABLE public.role_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.role_requests;

-- Create function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT,
  _related_id UUID DEFAULT NULL,
  _related_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id, related_type)
  VALUES (_user_id, _title, _message, _type, _related_id, _related_type)
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$$;

-- Create trigger function to notify on role request changes
CREATE OR REPLACE FUNCTION public.notify_role_request_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create notification for status changes (not new requests)
  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    IF NEW.status = 'approved' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'Role Request Approved',
        'Your request for ' || NEW.requested_role || ' role has been approved!',
        'success',
        NEW.id,
        'role_request'
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM public.create_notification(
        NEW.user_id,
        'Role Request Update',
        'Your request for ' || NEW.requested_role || ' role has been reviewed.',
        'warning',
        NEW.id,
        'role_request'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role request changes
CREATE TRIGGER role_request_status_change
AFTER UPDATE ON public.role_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_role_request_change();