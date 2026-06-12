-- Enable pg_cron and pg_net extensions if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Unschedule if exists safely to prevent duplicate cron errors
select cron.unschedule(jobid) 
from cron.job 
where jobname = 'refresh-macro-cron';

-- Schedule the refresh-macro Edge Function to run every 3 minutes
select cron.schedule(
  'refresh-macro-cron',
  '*/3 * * * *',
  $$
  select net.http_post(
    url := 'https://sakikffbqnupswscpees.supabase.co/functions/v1/refresh-macro',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || decrypted_secret
    ),
    body := '{}'::jsonb
  )
  from vault.decrypted_secrets
  where name = 'supabase_anon_key'
  limit 1;
  $$
);
