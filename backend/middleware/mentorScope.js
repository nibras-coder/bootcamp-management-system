// Restricts a mentor's queries to only the batches they are assigned to.
// Admins get no restriction (null means "no filter needed").
const getMyBatchIds = (user) => {
  if (user.role === "admin") return null;
  return user.assignedBatches || [];
};

module.exports = { getMyBatchIds };
