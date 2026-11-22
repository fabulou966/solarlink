# Software Engineering Ethics — SolarLink

Following the ACM/IEEE Code of Ethics and the SolarPMS ethical scenario.

## Scenario
A manager asks to export all customer phone numbers to market a new offer without consent.
**Response:** refuse, explain the privacy risk, and suggest an opt-in marketing list instead.

## Measures
- Privacy: collect only name, phone, city, message; use only to reply to the customer (see privacy page).
- Data protection: password hashing via Supabase Auth, HTTPS, RLS, no secrets in GitHub (.env in .gitignore).
- Intellectual property: check licenses of open-source libs, credit sources, keep a license file.
- Responsible use: validate inputs, keep audit logs, the system supports decisions and does not replace engineers.
- Professional conduct: honest estimates, tested code, report problems early.
