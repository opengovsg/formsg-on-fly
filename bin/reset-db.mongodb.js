/* eslint-disable */

db.adminFeedback.deleteMany({});
db.adminverifications.deleteMany({});
db.payments.deleteMany({});
db.myinfohashes.deleteMany({});
db.smscounts.deleteMany({});
db.tokens.deleteMany({});
db.verifications.deleteMany({});
db.formIssue.deleteMany({});
db.formfeedback.deleteMany({});
db.bounces.deleteMany({});
db.pendingsubmissions.deleteMany({});
db.logins.deleteMany({});
db.submissions.deleteMany({});
db.forms.deleteMany({});
db.workspaces.deleteMany({});

// Leave agencies, users and sessions alone, to ensure users can remain logged in
// Leave featureflags alone, to ensure feature flags remain consistent
