#!/bin/bash
# Admin Setup Script for Golden Axis Ventures
# Creates the first admin user in Supabase Auth
#
# Usage: npm run setup:admin -- admin@goldenaxisventures.in YourPassword123
#
# This script uses the Supabase service role key to create a user.
# It should only be run once during initial setup.

set -e

EMAIL=$1
PASSWORD=$2

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: npm run setup:admin -- <email> <password>"
  echo "Example: npm run setup:admin -- admin@goldenaxisventures.in MySecurePassword123"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env"
  exit 1
fi

SUPABASE_SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env 2>/dev/null | cut -d'=' -f2 || echo "")

echo "Creating admin user: $EMAIL"
echo "Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"email_confirm\": true}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "Success! Admin user created."
  echo "You can now log in at /admin with:"
  echo "  Email: $EMAIL"
  echo "  Password: (the password you set)"
else
  echo "Failed (HTTP $HTTP_CODE):"
  echo "$BODY"
  echo ""
  echo "If the user already exists, you can sign in with these credentials."
  echo "To reset the password, use the Supabase dashboard."
fi
