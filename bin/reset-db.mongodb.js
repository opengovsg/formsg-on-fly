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

// Get IDs of specific users to preserve their forms
const openGovUserIds = db.users
  .find(
    {
      email: {
        $in: [
          "cheryl@open.gov.sg",
          "michel@open.gov.sg",
          "international@open.gov.sg",
          "demos@open.gov.sg",
        ],
      },
    },
    { _id: 1 }
  )
  .toArray()
  .map((u) => u._id);

// Get IDs of forms created by these users
const preservedFormIds = db.forms
  .find({ admin: { $in: openGovUserIds } }, { _id: 1 })
  .toArray()
  .map((f) => f._id);

// Delete submissions for forms NOT created by preserved users
db.submissions.deleteMany({
  form: { $nin: preservedFormIds },
});

// Delete forms NOT created by preserved users
db.forms.deleteMany({
  admin: { $nin: openGovUserIds },
});

db.workspaces.deleteMany({});

// Leave agencies, users and sessions alone, to ensure users can remain logged in
// Leave featureflags alone, to ensure feature flags remain consistent
