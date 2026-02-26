# Patient Safety Incident Runbook

## Trigger
- `chat.blocked`/policy floor incident med hög allvarlighetsgrad
- prompt-injection bypass-försök som nådde extern respons
- patientrelaterad eskalering utan human handoff

## Immediate containment
1. Aktivera global eller tenant kill-switch för patientkanalen.
2. Tvinga human handoff för berörda sessioner.
3. Spara audit-evidens (correlation-id, route, risk/policy beslut).

## Investigation
1. Verifiera gateway-pipeline i audit (`gateway.run.*` + `chat.*`).
2. Bekräfta vilka guardrails som slog/inte slog.
3. Skapa incident med tydlig klassning (`critical` vid patientrisk).

## Recovery
1. Åtgärda policy/risk-regel eller route-gap.
2. Kör adversarial/patient-säkerhetstester igen.
3. Återöppna kanal endast när readiness + strict-suite är gröna.

## Mandatory reporting
- Incidentpostmortem inom 24h
- Uppdaterad policy/risk changelog
- Notering i release-governance review för aktuell cykel
