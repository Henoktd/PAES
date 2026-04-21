Dataverse import approach

1. Import all files in the 'base' folder first.
2. After those records exist, import the matching files in 'relationship-updates'.
3. During relationship-update import, map the first column as the primary-name match field and map each lookup column to the target table lookup.

Recommended base import order:
- PAES Partner.csv
- PAES Course.csv
- PAES Demand.csv
- PAES Event.csv
- PAES Supply.csv
- PAES Learner.csv
- PAES Readiness.csv
- PAES Deployment.csv
- PAES Event Registration.csv
- PAES Certification.csv
- PAES Payment.csv

Why this works:
The original CSVs include lookup fields. Dataverse often rejects those if the referenced records do not already exist or if the lookup mapping is not explicitly configured during import. Splitting the files lets you load base records first, then apply relationships in a second pass.
