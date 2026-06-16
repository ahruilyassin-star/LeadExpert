#!/bin/bash
# LeadExpert Deploy Script — upload dist/ naar Hostinger via FTP
# Configureer .env eerst: cp .env.example .env

set -e

# Laad .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ .env bestand niet gevonden. Kopieer .env.example naar .env en vul in."
  exit 1
fi

echo "🚀 Uploaden naar Hostinger..."
echo "   Host: $FTP_HOST"
echo "   User: $FTP_USER"
echo "   Map:  $FTP_REMOTE_DIR"

# Upload via lftp (of ncftp)
if command -v lftp &> /dev/null; then
  lftp -c "
    open -u $FTP_USER,$FTP_PASS $FTP_HOST
    mirror -R --delete dist/ $FTP_REMOTE_DIR
    quit
  "
  echo "✅ Upload klaar via lftp"
else
  echo "⚠️  lftp niet gevonden. Upload handmatig via Hostinger File Manager:"
  echo "   1. Open Hostinger hPanel → File Manager"
  echo "   2. Navigeer naar public_html/"
  echo "   3. Upload de inhoud van dist/ map"
fi
