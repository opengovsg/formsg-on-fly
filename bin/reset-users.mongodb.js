/* eslint-disable */

printjson(
  db.users.find(
    {},
    { _id: 0, created: 1, lastAccessed: 1, updatedAt: 1 },
    { sort: ["lastAccessed"] }
  )
);

db.sessions.deleteMany({});
db.users.deleteMany({
  email: {
    $nin: [
      "cheryl@open.gov.sg",
      "michel@open.gov.sg",
      "international@open.gov.sg",
      "demos@open.gov.sg",
    ],
  },
});
