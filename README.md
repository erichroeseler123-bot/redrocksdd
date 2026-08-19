# Red Rocks DD

Single source of truth for Red Rocks DD.

## Product

- $299 total trip price
- $49 paid online to reserve
- $250 due at pickup
- Licensed transportation operators only
- Vehicle capacity matched to the actual group
- Driver remains onsite through the Red Rocks event
- Founding-driver offer: $350 + tips first completed trip, then $250 + tips

## App

- Customer booking flow
- Secure booking-status page
- Driver signup/login/dashboard
- Admin operations
- Verified-trip reviews
- Resend inbound support email at `hello@redrocksdd.com`

## Deployment

This repository is intended to deploy directly to the existing Vercel project `redrocksdd` with repository root `/`.

Required environment variables:

- `RESEND_API_KEY`

The current customer checkout endpoint is configured in `config.js` and should remain server-authoritative.
