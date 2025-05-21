
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT (SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin'
  )) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Return the user info
  RETURN (
    SELECT json_build_object(
      'id', id,
      'email', email
    )
    FROM auth.users
    WHERE email = user_email
    LIMIT 1
  );
END;
$$;
