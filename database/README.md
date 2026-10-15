# Database Layer - Placement Management System

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Table definitions with PK/FK/CHECK constraints, 3NF |
| `triggers.sql` | DB triggers: block ineligible apps, audit log, mark placed |
| `procedures.sql` | `is_eligible()` function, `select_student()` procedure, tier rules |
| `views.sql` | Reporting views: dept placement, company report, eligible jobs |
| `seed.sql` | Static seed data (departments, companies, jobs, 10 students) |
| `seed.py` | Faker generator for 200 students, 15 companies, 40 jobs |

## Setup

```bash
# 1. Start MySQL
sudo service mysql start   # or use your preferred method

# 2. Run schema
mysql -u root -p < schema.sql

# 3. Run triggers (functions must be created before triggers)
mysql -u root -p < procedures.sql
mysql -u root -p < triggers.sql

# 4. Run views
mysql -u root -p < views.sql

# 5. Run seed (static or generated)
mysql -u root -p < seed.sql
# OR: python seed.py > seed_generated.sql && mysql -u root -p < seed_generated.sql
```

## Key Design Decisions

- **3NF**: No repeating groups, all non-key attributes depend on the full PK
- **Constraints in DB**: Eligibility, backlogs, CGPA range enforced at DB level
- **Audit log**: Populated by trigger — cannot be bypassed by any app
- **Tier rules**: One-offer-per-student enforced in `select_student()` procedure
- **is_placed flag**: Blocks further applications once a student has an offer