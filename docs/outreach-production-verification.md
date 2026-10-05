# Outreach Production Verification

## Implemented
- Migration 20260916140000_outreach_pipeline.sql
- Campaign create/activate/pause/resume (admin session)
- Audience preview counts
- marketingSendGuard + sequence cron
- Default 4-step sequence
- Nav + Command Center link

## NOT VERIFIED here
- Production Supabase migration apply
- Live SMTP sequence delivery
- Admin browser E2E with credentials

## Deploy
1. Run migration in Supabase
2. Deploy main
3. Create dry-run campaign as admin → activate
