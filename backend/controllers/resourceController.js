const Resource = require("../models/Resource");
const Batch = require("../models/Batch");
const User = require("../models/User");
const { notifyNewResource } = require("./notificationController");

// Get resources (filtered by role)
const getResources = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === "admin") {
      query = {};
    } else if (user.role === "mentor") {
      // Find batches/tracks assigned to this mentor
      const batches = await Batch.find({ mentors: user.id }).select("track _id");
      const tracks = batches.map((b) => b.track).filter(Boolean);
      const batchIds = batches.map((b) => b._id);

      query = {
        $or: [
          { uploadedBy: user.id }, // Created by this mentor
          { target: "All Tracks" },
          { target: { $in: tracks } },
          { batch: { $in: batchIds } },
        ],
      };
    } else if (user.role === "student") {
      const student = await User.findById(user.id).populate("batch", "track");
      const orList = [{ target: "All Tracks" }];
      if (student?.batch?.track) {
        orList.push({ target: student.batch.track });
        orList.push({ batch: student.batch._id });
      }
      if (student?.mentor) {
        orList.push({ uploadedBy: student.mentor });
        orList.push({ target: "My Assigned Students" });
      }
      query = { $or: orList };
    }

    const resources = await Resource.find(query)
      .populate("uploadedBy", "name email role")
      .populate("batch", "name track")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get resources",
      error: error.message,
    });
  }
};

// Create a resource
const createResource = async (req, res) => {
  try {
    const { title, description, target, category, link, batch } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    let fileUrl = req.body.fileUrl;
    if (req.file) {
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const resource = await Resource.create({
      title,
      description,
      target: target || "All Tracks",
      category: category || "Document",
      link,
      fileUrl,
      batch: batch || null,
      uploadedBy: req.user.id,
    });

    // Notify students and mentors about the new resource
    try {
      await notifyNewResource(resource._id);
    } catch (notifyError) {
      console.error("Failed to send resource notification:", notifyError);
      // Don't fail the request if notification fails
    }

    const populatedResource = await Resource.findById(resource._id)
      .populate("uploadedBy", "name email role")
      .populate("batch", "name track");

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: populatedResource,
    });
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create resource",
      error: error.message,
    });
  }
};

// Delete a resource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Check authority: admin or the mentor who uploaded it
    if (req.user.role !== "admin" && String(resource.uploadedBy) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete resources you uploaded",
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete resource",
      error: error.message,
    });
  }
};

// Update a resource
const updateResource = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { title, description, target, category, link, batch } = req.body;

    let resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Check authority: admin or the mentor who uploaded it
    if (req.user.role !== "admin" && String(resource.uploadedBy) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update resources you uploaded",
      });
    }

    if (title) resource.title = title;
    if (description) resource.description = description;
    if (target) resource.target = target;
    if (category) resource.category = category;
    if (link !== undefined) resource.link = link;
    if (batch !== undefined) resource.batch = batch || null;

    if (req.file) {
      resource.fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl !== undefined) {
      resource.fileUrl = req.body.fileUrl; // Allowing removal or update of fileUrl text if needed
    }

    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
      .populate("uploadedBy", "name email role")
      .populate("batch", "name track");

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: populatedResource,
    });
  } catch (error) {
    console.error("Update resource error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update resource",
      error: error.message,
    });
  }
};

module.exports = { getResources, createResource, updateResource, deleteResource };
