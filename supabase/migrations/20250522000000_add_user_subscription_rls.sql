
-- Enable RLS on user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions table
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING ((SELECT is_admin()));

CREATE POLICY "Admins can insert all subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK ((SELECT is_admin()));

CREATE POLICY "Admins can delete all subscriptions"
ON public.user_subscriptions
FOR DELETE
USING ((SELECT is_admin()));
