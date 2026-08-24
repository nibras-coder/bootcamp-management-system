const Resource = require("../models/Resource");

// Get all resources
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get resources", error: error.message });
  }
};

// Create a resource
const createResource = async (req, res) => {
  try {
    const { title, description, target, link, batch } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }
    let fileUrl = req.body.fileUrl;
    if (req.file) {
      // Create absolute URL using req.protocol and req.get('host')
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    const resource = await Resource.create({ title, description, target, link, fileUrl, batch });
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create resource", error: error.message });
  }
};

// Delete a resource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    res.status(200).json({ success: true, message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete resource", error: error.message });
  }
};

module.exports = { getResources, createResource, deleteResource };
