const Batch = require("../models/Batch");

const getMentorBatchIds = async (mentorId) => {
  const batches = await Batch.find({
    mentors: mentorId,
  }).select("_id");

  return batches.map((batch) => batch._id);
};

module.exports = {
  getMentorBatchIds,
};