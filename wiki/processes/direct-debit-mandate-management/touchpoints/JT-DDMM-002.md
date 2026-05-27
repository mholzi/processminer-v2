---
id: JT-DDMM-002
type: cx-touchpoint
section: touchpoints
title: Submit Bulk Mandate File (SFTP)
status: draft
confidence: high
source: ddmm-client-journey-specialist
channel: CH-DDMM-002
occursAt: [PS-DDMM-001]
---
## What the client does
The creditor prepares and drops a bulk mandate file to the bank's SFTP endpoint; the portal picks it up automatically, requiring no manual portal interaction beyond the file transfer.

## What the bank does
The Creditor Portal ingests the file and queues its mandate records for processing; the creditor can monitor batch progress in the portal.

## Experience
Low friction at the point of submission for technically configured creditors; effort is front-loaded into file preparation and format compliance. The creditor must then switch to the portal to monitor batch progress — there is no push notification at ingestion.
