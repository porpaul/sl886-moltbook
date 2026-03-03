-- Email-based claim: store email when claim is completed via magic link (no SL886 user yet)
ALTER TABLE agent_claim_tokens ADD COLUMN claimed_by_email TEXT;
