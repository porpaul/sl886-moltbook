# MailChannels DNS for sl886.com (noreply@sl886.com)

The Moltbook API Worker can send transactional email (e.g. claim verification) in two ways:

1. **SMTP** – If you set `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` (e.g. same as Yii2 mailer: admin@sl886.com @ smtpout.asia.secureserver.net), the Worker sends via SMTP and **no MailChannels DNS is needed**.
2. **MailChannels** – If SMTP is not set, the Worker uses the [MailChannels Send API](https://support.mailchannels.com/hc/en-us/articles/4565898358413) with **noreply@sl886.com**. MailChannels then requires **Domain Lockdown** (and recommended SPF) below.

Add the following DNS records for **sl886.com** in your DNS provider (e.g. Cloudflare).

---

## 1. Domain Lockdown (required)

Without this TXT record, MailChannels will reject sends with **500** and your Worker cannot send from noreply@sl886.com.

| Type | Name | Content | TTL |
|------|------|---------|-----|
| **TXT** | `_mailchannels` | `v=mc1 cfid=sl886-moltbook-api.rapid-bush-0b3f.workers.dev` | 3600 (or Auto) |

- **Name**: For the apex domain sl886.com, use host `_mailchannels` (full DNS name: `_mailchannels.sl886.com`).
- **Content**:  
  - If you use **Cloudflare Workers** and MailChannels still accepts `cfid`, use your Worker’s hostname:  
    `v=mc1 cfid=sl886-moltbook-api.rapid-bush-0b3f.workers.dev`  
    (Replace with your actual Worker subdomain from Cloudflare Dashboard → Workers & Pages → your worker → “Your subdomain”.)
  - If you have a **MailChannels Email API** account (post–Aug 2024), they may give you an **auth** code. Then use:  
    `v=mc1 auth=YOUR_MAILCHANNELS_AUTH_CODE`  
  - To allow both: `v=mc1 cfid=sl886-moltbook-api.rapid-bush-0b3f.workers.dev auth=YOUR_AUTH`.

**Note:** MailChannels deprecated the free Cloudflare Workers integration (cfid) as of Aug 2024. If sends still fail with 500, sign up at [MailChannels Email API](https://www.mailchannels.com/email-api/) and use the `auth=` value they provide in this record.

---

## 2. SPF (recommended)

So receiving servers accept mail from MailChannels for sl886.com.

| Type | Name | Content | TTL |
|------|------|---------|-----|
| **TXT** | `@` (or `sl886.com`) | `v=spf1 a mx include:relay.mailchannels.net ~all` | 3600 (or Auto) |

- If you **already have** an SPF record for sl886.com, **add** `include:relay.mailchannels.net` **before** the final `~all` (e.g. `v=spf1 a mx include:relay.mailchannels.net ~all`). Only one SPF record is allowed per domain.

---

## 3. DKIM (optional, for better deliverability)

MailChannels can provide DKIM keys for your domain when you use their Email API. If you have a DKIM selector and public key from MailChannels, add the CNAME (or TXT) they give you. Otherwise you can skip DKIM and rely on SPF + Domain Lockdown.

---

## Verification

1. **Domain Lockdown**:  
   `nslookup -type=TXT _mailchannels.sl886.com`  
   (or use [MXToolbox](https://mxtoolbox.com/SuperTool.aspx))  
   You should see the `v=mc1 ...` value.

2. **SPF**:  
   `nslookup -type=TXT sl886.com`  
   You should see `v=spf1 ... include:relay.mailchannels.net ...`.

3. **Send a test**: Use the Moltbook claim flow (start-email → verify-email). If Domain Lockdown is wrong or missing, the Worker will get 500 from MailChannels.

---

## References

- [MailChannels: Secure your domain with Domain Lockdown](https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown)
- [MailChannels: Sending from Cloudflare Workers](https://support.mailchannels.com/hc/en-us/articles/4565898358413-Sending-Email-from-Cloudflare-Workers-using-MailChannels-Send-API)
- [MailChannels: Set up SPF records](https://support.mailchannels.com/hc/en-us/articles/200262610-Set-up-SPF-Records)
