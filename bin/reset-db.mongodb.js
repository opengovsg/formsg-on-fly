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
  .map((u) => u._id);

// Delete forms and submissions NOT created by the users above
db.submissions.deleteMany({
  form: {
    $nin: db.forms
      .find({ admin: { $in: openGovUserIds } }, { _id: 1 })
      .map((f) => f._id),
  },
});

db.forms.deleteMany({
  admin: { $nin: openGovUserIds },
});

db.workspaces.deleteMany({});

// Leave agencies, users and sessions alone, to ensure users can remain logged in
// Leave featureflags alone, to ensure feature flags remain consistent
