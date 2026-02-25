#!/usr/bin/env bash
set -euo pipefail

PUBLIC_URL="${BASE_URL:-}"
RUN_LOCAL=1
RUN_PUBLIC=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --public-url)
      PUBLIC_URL="${2:-}"
      shift 2
      ;;
    --skip-local)
      RUN_LOCAL=0
      shift
      ;;
    --skip-public)
      RUN_PUBLIC=0
      shift
      ;;
    *)
      echo "Okänd flagga: $1"
      echo "Använd: [--public-url https://arcana.hairtpclinic.se] [--skip-local] [--skip-public]"
      exit 1
      ;;
  esac
done

echo "== Arcana Pilot Preflight =="
echo

if [[ "$RUN_LOCAL" -eq 1 ]]; then
  echo "1) Lokal verify"
  npm run verify
  echo

  echo "2) Git large-file check"
  npm run git:check-large
  echo
else
  echo "1) Lokal verify SKIP"
  echo "2) Git large-file check SKIP"
  echo
fi

if [[ "$RUN_PUBLIC" -eq 1 ]]; then
  if [[ -z "$PUBLIC_URL" ]]; then
    echo "❌ Public smoke kräver BASE_URL eller --public-url."
    echo "Exempel: npm run preflight:pilot -- --public-url https://arcana.hairtpclinic.se"
    exit 1
  fi
  echo "3) Public smoke ($PUBLIC_URL)"
  BASE_URL="$PUBLIC_URL" npm run smoke:public
  echo

  if [[ -n "${ARCANA_OWNER_EMAIL:-}" && -n "${ARCANA_OWNER_PASSWORD:-}" ]]; then
    OPS_STRICT_SCRIPT="ops:suite:strict"
    ALLOW_GUARD_FAIL_IN_HEAL_MODE=0
    case "${ARCANA_PREFLIGHT_USE_HEAL_ALL:-false}" in
      1|true|TRUE|yes|YES|on|ON)
        OPS_STRICT_SCRIPT="ops:suite:strict:heal:all"
        ALLOW_GUARD_FAIL_IN_HEAL_MODE=1
        ;;
    esac
    case "${ARCANA_PREFLIGHT_USE_HEAL:-false}" in
      1|true|TRUE|yes|YES|on|ON)
        if [[ "$OPS_STRICT_SCRIPT" == "ops:suite:strict" ]]; then
          OPS_STRICT_SCRIPT="ops:suite:strict:heal"
          ALLOW_GUARD_FAIL_IN_HEAL_MODE=1
        fi
        ;;
    esac

    echo "4) Public readiness guard ($PUBLIC_URL)"
    set +e
    BASE_URL="$PUBLIC_URL" npm run preflight:readiness:guard
    GUARD_EXIT_CODE=$?
    set -e
    if [[ "$GUARD_EXIT_CODE" -ne 0 ]]; then
      if [[ "$GUARD_EXIT_CODE" -eq 2 && "$ALLOW_GUARD_FAIL_IN_HEAL_MODE" -eq 1 ]]; then
        echo "⚠️ Readiness guard blocker kvarstår, fortsätter p.g.a. heal-läge (${OPS_STRICT_SCRIPT})."
      else
        echo "❌ Public readiness guard misslyckades (exit: $GUARD_EXIT_CODE)."
        exit "$GUARD_EXIT_CODE"
      fi
    fi
    echo

    echo "5) Public ${OPS_STRICT_SCRIPT} ($PUBLIC_URL)"
    BASE_URL="$PUBLIC_URL" npm run "$OPS_STRICT_SCRIPT"
    echo

    if [[ "$ALLOW_GUARD_FAIL_IN_HEAL_MODE" -eq 1 && "${GUARD_EXIT_CODE:-0}" -eq 2 ]]; then
      echo "6) Public readiness guard verify after heal ($PUBLIC_URL)"
      BASE_URL="$PUBLIC_URL" npm run preflight:readiness:guard
      echo
    fi
  else
    echo "4) Public readiness guard SKIP (saknar ARCANA_OWNER_EMAIL/ARCANA_OWNER_PASSWORD)"
    echo
    echo "5) Public ops suite strict SKIP (saknar ARCANA_OWNER_EMAIL/ARCANA_OWNER_PASSWORD)"
    echo
  fi
else
  echo "3) Public smoke SKIP"
  echo "4) Public readiness guard SKIP"
  echo "5) Public ops suite strict SKIP"
  echo
fi

echo "🎯 Pilot preflight klart."
