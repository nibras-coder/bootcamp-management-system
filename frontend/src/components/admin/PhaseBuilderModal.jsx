import React, { useState } from "react";
import { Plus, X, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const PhaseBuilderModal = ({ batch, isOpen, onClose, onUpdated }) => {
  const { toast } = useToast();
  const [phases, setPhases] = useState(batch?.phases || []);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddPhase = () => {
    setPhases([
      ...phases,
      {
        name: `Phase ${phases.length + 1}`,
        shortMessage: "",
        longMessage: "",
        order: phases.length + 1,
        fields: [],
        isActive: true,
      },
    ]);
  };

  const handlePhaseChange = (index, key, value) => {
    const updated = [...phases];
    updated[index][key] = value;
    setPhases(updated);
  };

  const movePhase = (index, direction) => {
    if (direction === "up" && index > 0) {
      const updated = [...phases];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      // fix order
      updated.forEach((p, i) => (p.order = i + 1));
      setPhases(updated);
    } else if (direction === "down" && index < phases.length - 1) {
      const updated = [...phases];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      updated.forEach((p, i) => (p.order = i + 1));
      setPhases(updated);
    }
  };

  const deletePhase = (index) => {
    const updated = phases.filter((_, i) => i !== index);
    updated.forEach((p, i) => (p.order = i + 1));
    setPhases(updated);
  };

  const handleAddField = (phaseIndex) => {
    const updated = [...phases];
    updated[phaseIndex].fields.push({
      name: "New Field",
      type: "text",
      required: true,
    });
    setPhases(updated);
  };

  const handleFieldChange = (phaseIndex, fieldIndex, key, value) => {
    const updated = [...phases];
    updated[phaseIndex].fields[fieldIndex][key] = value;
    setPhases(updated);
  };

  const deleteField = (phaseIndex, fieldIndex) => {
    const updated = [...phases];
    updated[phaseIndex].fields = updated[phaseIndex].fields.filter((_, i) => i !== fieldIndex);
    setPhases(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await API.put(`/batches/${batch._id}`, {
        phases,
      });
      if (response.data.success) {
        toast.success("Phases updated successfully!");
        onUpdated(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update phases:", error);
      toast.error("Failed to update phases");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configure Application Process</h2>
            <p className="text-sm text-gray-500">For Batch: {batch?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50">
          {phases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No phases configured. Add the first phase to start building your admission process.</p>
            </div>
          ) : (
            phases.map((phase, pIndex) => (
              <div key={pIndex} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1 rounded">Phase {phase.order}</span>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) => handlePhaseChange(pIndex, "name", e.target.value)}
                        className="font-bold text-lg bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:outline-none focus:border-teal-500 text-gray-900 dark:text-white w-1/2"
                        placeholder="e.g. Technical Assessment"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => movePhase(pIndex, "up")} disabled={pIndex === 0} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30">
                      <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button onClick={() => movePhase(pIndex, "down")} disabled={pIndex === phases.length - 1} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30">
                      <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button onClick={() => deletePhase(pIndex)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Short Message (Optional)</label>
                    <input
                      type="text"
                      value={phase.shortMessage}
                      onChange={(e) => handlePhaseChange(pIndex, "shortMessage", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      placeholder="Show us your technical ability"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline (Optional)</label>
                    <input
                      type="date"
                      value={phase.deadline ? new Date(phase.deadline).toISOString().split("T")[0] : ""}
                      onChange={(e) => handlePhaseChange(pIndex, "deadline", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Long Message / Instructions (Optional)</label>
                    <textarea
                      value={phase.longMessage}
                      onChange={(e) => handlePhaseChange(pIndex, "longMessage", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      rows="2"
                      placeholder="Complete the challenge below and submit your solution."
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Submission Fields</h4>
                    <button onClick={() => handleAddField(pIndex)} className="text-xs flex items-center text-teal-600 hover:text-teal-700 font-medium">
                      <Plus className="w-3 h-3 mr-1" /> Add Field
                    </button>
                  </div>

                  {phase.fields.length === 0 ? (
                    <p className="text-xs text-gray-500 italic mb-2">No submission fields required. Students will simply acknowledge this phase.</p>
                  ) : (
                    <div className="space-y-2">
                      {phase.fields.map((field, fIndex) => (
                        <div key={fIndex} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleFieldChange(pIndex, fIndex, "name", e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Field Name (e.g. GitHub URL)"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => handleFieldChange(pIndex, fIndex, "type", e.target.value)}
                            className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="text">Short Text</option>
                            <option value="long_text">Long Text</option>
                            <option value="url">URL Link</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone Number</option>
                            <option value="number">Number</option>
                            <option value="file">File Upload</option>
                          </select>
                          <label className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleFieldChange(pIndex, fIndex, "required", e.target.checked)}
                              className="rounded text-teal-600 focus:ring-teal-500"
                            />
                            <span>Req</span>
                          </label>
                          <button onClick={() => deleteField(pIndex, fIndex)} className="text-gray-400 hover:text-red-500 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          <button onClick={handleAddPhase} className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center justify-center font-medium">
            <Plus className="w-5 h-5 mr-2" /> Add Phase
          </button>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3 bg-white dark:bg-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50">
            {loading ? "Saving..." : "Save Phase Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseBuilderModal;
