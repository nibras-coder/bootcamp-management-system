import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  UserPlus,
  Send,
  Loader2,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Menu,
  ArrowLeft,
  Filter,
  Check,
  Shield,
  GraduationCap,
  Sparkles,
  Bell,
  Edit2,
  Copy,
  MoreVertical,
  ArrowDown,
} from "lucide-react";
import Sidebar from "../components/mentor/Sidebar";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import { getSocket } from "../utils/socket";

function Communities() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, confirm } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // State
  const [communities, setCommunities] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackFilter, setSelectedTrackFilter] = useState("All");

  // Active Chat State
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesBelow, setNewMessagesBelow] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);


  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [managingCommunity, setManagingCommunity] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    track: "",
    selectedStudentIds: [],
    isPrivate: true,
  });

  // Modal Student Filter State
  const [modalStudentSearch, setModalStudentSearch] = useState("");
  const [modalTrackFilter, setModalTrackFilter] = useState("All");

  // Fetch communities & assigned students
  const fetchCommunities = async () => {
    try {
      const res = await API.get("/communities");
      if (res.data.success) {
        setCommunities(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load communities:", err);
      toast.error(err.response?.data?.message || "Failed to load communities");
    }
  };

  const fetchAssignedStudents = async () => {
    try {
      const res = await API.get("/mentor/students");
      if (res.data.success) {
        setAssignedStudents(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load assigned students:", err);
    }
  };


  const fetchUnreadCounts = async () => {
    try {
      const res = await API.get("/communities/unread");
      if (res.data.success && res.data.communityCounts) {
        setUnreadCounts(res.data.communityCounts);
      }
    } catch (err) {
      console.error("Failed to load unread counts:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchCommunities(), fetchAssignedStudents(), fetchUnreadCounts()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Socket setup for global community notifications and active chat
  useEffect(() => {
    const socket = getSocket();

    if (activeCommunity) {
      socket.emit("community:join", activeCommunity._id, (res) => {
        if (res && !res.success) {
          toast.error(res.message || "Failed to join chat room");
        }
      });
    }

    const handleNewMessage = (msg) => {
      const commId = String(msg.community?._id || msg.community);
      const isMe = String(msg.sender?._id || msg.sender) === String(user._id || user.id);

      if (activeCommunity && String(activeCommunity._id) === commId) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(msg._id))) {
            return prev;
          }
          return [...prev, msg];
        });

        if (isAtBottom) {
          setTimeout(scrollToBottom, 50);
        } else {
          setNewMessagesBelow((prev) => prev + 1);
        }

        // Mark as read in DB
        API.put(`/communities/${commId}/read`).catch(() => {});
      } else if (!isMe) {
        const targetComm = communities.find((c) => String(c._id) === commId);
        const commName = msg.community?.name || targetComm?.name || "Community Circle";
        const senderName = msg.sender?.name || "Student";

        toast.info(msg.content, `New message from ${senderName} in ${commName}`);

        setUnreadCounts((prev) => ({
          ...prev,
          [commId]: (prev[commId] || 0) + 1,
        }));
      }
    };

    const handleMessageUpdated = (updatedMsg) => {
      const commId = String(updatedMsg.community?._id || updatedMsg.community);
      if (activeCommunity && String(activeCommunity._id) === commId) {
        setMessages((prev) =>
          prev.map((m) => (String(m._id) === String(updatedMsg._id) ? updatedMsg : m))
        );
      }
    };

    const handleMessageDeleted = ({ messageId, communityId }) => {
      if (activeCommunity && String(activeCommunity._id) === String(communityId)) {
        setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
      }
    };

    const handleNotificationNew = (notif) => {
      const commId = String(notif.community?._id || notif.community);
      if (!activeCommunity || String(activeCommunity._id) !== commId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [commId]: (prev[commId] || 0) + 1,
        }));
      }
    };

    const handleNotificationRead = ({ communityId }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [String(communityId)]: 0,
      }));
    };

    const handleTyping = ({ communityId, userId, userName, isTyping: typing }) => {
      if (activeCommunity && String(communityId) === String(activeCommunity._id)) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          if (typing) {
            updated[userId] = userName;
          } else {
            delete updated[userId];
          }
          return updated;
        });
      }
    };

    socket.on("community:message:new", handleNewMessage);
    socket.on("community:message:updated", handleMessageUpdated);
    socket.on("community:message:deleted", handleMessageDeleted);
    socket.on("community:notification:new", handleNotificationNew);
    socket.on("community:notification:read", handleNotificationRead);
    socket.on("community:typing", handleTyping);

    return () => {
      if (activeCommunity) {
        socket.emit("community:leave", activeCommunity._id);
      }
      socket.off("community:message:new", handleNewMessage);
      socket.off("community:message:updated", handleMessageUpdated);
      socket.off("community:message:deleted", handleMessageDeleted);
      socket.off("community:notification:new", handleNotificationNew);
      socket.off("community:notification:read", handleNotificationRead);
      socket.off("community:typing", handleTyping);
    };
  }, [activeCommunity, communities, user, isAtBottom]);

  // Scroll detection
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setNewMessagesBelow(0);
    }
  };

  // Auto scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessagesBelow(0);
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);

  // Open Chat
  const handleOpenChat = async (community) => {
    setActiveCommunity(community);
    setEditingMessageId(null);
    setActiveMenuMessageId(null);
    setNewMessagesBelow(0);
    setUnreadCounts((prev) => ({
      ...prev,
      [String(community._id)]: 0,
    }));
    setMessagesLoading(true);
    setMessages([]);
    try {
      const res = await API.get(`/communities/${community._id}/messages`);
      if (res.data.success) {
        setMessages(res.data.data || []);
      }
      // Mark notifications as read in backend
      API.put(`/communities/${community._id}/read`).catch(() => {});
    } catch (err) {
      console.error("Failed to load community messages:", err);
      toast.error("Failed to load chat history");
    } finally {
      setMessagesLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // Message Actions: Edit, Delete, Copy
  const handleStartEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditingContent(msg.content);
    setActiveMenuMessageId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async (messageId) => {
    if (!editingContent.trim() || savingEdit || !activeCommunity) return;
    setSavingEdit(true);
    try {
      const res = await API.put(
        `/communities/${activeCommunity._id}/messages/${messageId}`,
        { content: editingContent.trim() }
      );
      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) => (String(m._id) === String(messageId) ? res.data.data : m))
        );
        setEditingMessageId(null);
        setEditingContent("");
        toast.success("Message edited successfully");
      }
    } catch (err) {
      console.error("Failed to edit message:", err);
      toast.error(err.response?.data?.message || "Failed to edit message");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setActiveMenuMessageId(null);
    const confirmed = await confirm({
      title: "Delete Message?",
      message: "Are you sure you want to delete this message? This action cannot be undone.",
    });

    if (!confirmed || !activeCommunity) return;

    try {
      const res = await API.delete(
        `/communities/${activeCommunity._id}/messages/${messageId}`
      );
      if (res.data.success) {
        setMessages((prev) => prev.filter((m) => String(m._id) !== String(messageId)));
        toast.success("Message deleted");
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  const handleCopyMessage = (msg) => {
    setActiveMenuMessageId(null);
    if (!msg?.content) return;
    navigator.clipboard
      .writeText(msg.content)
      .then(() => {
        setCopiedMessageId(msg._id);
        toast.success("Message copied to clipboard");
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch((err) => {
        console.error("Clipboard copy error:", err);
        toast.error("Failed to copy message");
      });
  };



  // Send Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeCommunity || sendingMessage) return;

    const content = newMessage.trim();
    setSendingMessage(true);

    try {
      const res = await API.post(`/communities/${activeCommunity._id}/messages`, {
        content,
      });

      if (res.data.success) {
        setNewMessage("");
        // Socket broadcast handles adding message to state
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(res.data.data._id))) {
            return prev;
          }
          return [...prev, res.data.data];
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      description: "",
      track: "",
      selectedStudentIds: [],
      isPrivate: true,
    });
    setModalStudentSearch("");
    setModalTrackFilter("All");
    setShowCreateModal(true);
  };

  // Create Community
  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Community name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post("/communities", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        track: formData.track.trim() || "General",
        members: formData.selectedStudentIds,
        isPrivate: formData.isPrivate,
      });

      if (res.data.success) {
        toast.success("Community created successfully!");
        setShowCreateModal(false);
        fetchCommunities();
      }
    } catch (err) {
      console.error("Create community error:", err);
      toast.error(err.response?.data?.message || "Failed to create community");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Manage Members Modal
  const handleOpenMembersModal = (community) => {
    setManagingCommunity(community);
    const existingIds = (community.members || []).map((m) => String(m._id || m));
    setFormData({
      selectedStudentIds: existingIds,
    });
    setModalStudentSearch("");
    setModalTrackFilter("All");
    setShowMembersModal(true);
  };

  // Save Members
  const handleSaveMembers = async () => {
    if (!managingCommunity) return;
    setSubmitting(true);
    try {
      const res = await API.post(`/communities/${managingCommunity._id}/members`, {
        memberIds: formData.selectedStudentIds,
      });

      if (res.data.success) {
        toast.success("Community members updated!");
        setShowMembersModal(false);
        fetchCommunities();
        if (activeCommunity && activeCommunity._id === managingCommunity._id) {
          setActiveCommunity(res.data.data);
        }
      }
    } catch (err) {
      console.error("Update members error:", err);
      toast.error(err.response?.data?.message || "Failed to update members");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Community
  const handleDeleteCommunity = async (community) => {
    const isConfirmed = await confirm({
      title: "Delete Community",
      message: `Are you sure you want to delete "${community.name}"? All chat history and memberships will be permanently deleted.`,
      confirmText: "Delete Community",
      confirmVariant: "danger",
    });

    if (!isConfirmed) return;

    try {
      const res = await API.delete(`/communities/${community._id}`);
      if (res.data.success) {
        toast.success("Community deleted successfully");
        if (activeCommunity && activeCommunity._id === community._id) {
          setActiveCommunity(null);
        }
        fetchCommunities();
      }
    } catch (err) {
      console.error("Delete community error:", err);
      toast.error(err.response?.data?.message || "Failed to delete community");
    }
  };

  // Toggle student selection in modal
  const toggleStudentSelection = (studentId) => {
    const sId = String(studentId);
    setFormData((prev) => {
      const exists = prev.selectedStudentIds.includes(sId);
      return {
        ...prev,
        selectedStudentIds: exists
          ? prev.selectedStudentIds.filter((id) => id !== sId)
          : [...prev.selectedStudentIds, sId],
      };
    });
  };

  // Select all filtered students
  const selectAllFiltered = (filteredList) => {
    const filteredIds = filteredList.map((s) => String(s._id));
    setFormData((prev) => {
      const allSelected = filteredIds.every((id) =>
        prev.selectedStudentIds.includes(id)
      );
      if (allSelected) {
        return {
          ...prev,
          selectedStudentIds: prev.selectedStudentIds.filter(
            (id) => !filteredIds.includes(id)
          ),
        };
      } else {
        const union = new Set([...prev.selectedStudentIds, ...filteredIds]);
        return {
          ...prev,
          selectedStudentIds: Array.from(union),
        };
      }
    });
  };

  // Extract unique tracks from assigned students
  const studentTracks = Array.from(
    new Set(
      assignedStudents
        .map((s) => s.batch?.track || s.batch?.name)
        .filter(Boolean)
    )
  );

  // Extract unique tracks from communities
  const communityTracks = Array.from(
    new Set(communities.map((c) => c.track).filter(Boolean))
  );

  // Filtered assigned students for modals
  const modalFilteredStudents = assignedStudents.filter((s) => {
    const q = modalStudentSearch.toLowerCase();
    const matchesQuery =
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q));

    const studentTrack = s.batch?.track || s.batch?.name || "General";
    const matchesTrack =
      modalTrackFilter === "All" || studentTrack === modalTrackFilter;

    return matchesQuery && matchesTrack;
  });

  // Filtered communities list for main view
  const filteredCommunities = communities.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.track && c.track.toLowerCase().includes(q));

    const matchesTrack =
      selectedTrackFilter === "All" || c.track === selectedTrackFilter;

    return matchesQuery && matchesTrack;
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 dark:text-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-64 p-4 md:p-8 overflow-y-auto min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-teal-900 dark:bg-black text-white mb-5 rounded-xl border border-teal-800 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-teal-800 text-teal-200"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold text-sm">Mentor Communities</span>
          </div>
          <span className="text-xs text-teal-300 font-medium">{user.name || "Mentor"}</span>
        </div>

        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Users className="text-teal-600 dark:text-teal-400" size={26} />
              Mentor Communities
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Create private community circles exclusively for your assigned students with real-time chat.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={18} />
              <span>Create Community</span>
            </button>
          </div>
        </div>

        {/* Chat / Main layout */}
        {activeCommunity ? (
          /* Active Community Chat View */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col flex-1 min-h-[600px] mb-6">
            {/* Chat Top Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveCommunity(null)}
                  className="p-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Back to all communities"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                      {activeCommunity.name}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
                      {activeCommunity.track || "General"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeCommunity.members?.length || 0} assigned student member
                    {activeCommunity.members?.length === 1 ? "" : "s"} · {activeCommunity.description || "Active community circle"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenMembersModal(activeCommunity)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <UserPlus size={14} />
                  <span>Manage Members</span>
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div
              ref={chatScrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 max-h-[500px] min-h-[350px] bg-[#f8fafc] dark:bg-[#0c1220]/50 relative"
            >
              {messagesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="animate-spin mb-2 text-teal-600" size={28} />
                  <p className="text-xs">Loading community chat history...</p>
                </div>
              ) : messages.length ? (
                messages.map((msg) => {
                  const isMe = String(msg.sender?._id || msg.sender) === String(user._id || user.id);
                  const isSenderMentor = msg.sender?.role === "mentor";
                  const isEditingThis = editingMessageId === msg._id;
                  const isMenuOpen = activeMenuMessageId === msg._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-start gap-2.5 group relative ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${
                          isSenderMentor
                            ? "bg-teal-700 text-white"
                            : "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                        }`}
                      >
                        {(msg.sender?.name || (isSenderMentor ? "M" : "S")).charAt(0).toUpperCase()}
                      </div>

                      {/* Bubble Container */}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] ${
                          isMe ? "items-end" : "items-start"
                        } flex flex-col relative`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 flex-wrap">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {isMe ? "You" : msg.sender?.name || "Member"}
                          </span>
                          {isSenderMentor && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-800">
                              Mentor
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.isEdited && (
                            <span
                              title={msg.editedAt ? `Edited at ${new Date(msg.editedAt).toLocaleTimeString()}` : "Edited"}
                              className="text-[10px] text-gray-400 italic font-normal"
                            >
                              · Edited
                            </span>
                          )}
                        </div>

                        {/* Inline Edit or Bubble */}
                        {isEditingThis ? (
                          <div className="w-full min-w-[240px] sm:min-w-[320px] p-3 rounded-2xl bg-white dark:bg-gray-800 border border-teal-500 shadow-md">
                            <textarea
                              rows={3}
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit(msg._id);
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                              className="w-full text-sm bg-gray-50 dark:bg-gray-700/60 p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none text-gray-900 dark:text-gray-100"
                              placeholder="Edit your message..."
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={savingEdit}
                                className="px-3 py-1 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(msg._id)}
                                disabled={!editingContent.trim() || savingEdit}
                                className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                              >
                                {savingEdit ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative group/bubble flex items-center">
                            {/* Message Content Bubble */}
                            <div
                              className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                                isMe
                                  ? "bg-teal-600 text-white rounded-tr-none"
                                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              {msg.content}
                            </div>

                            {/* Message Hover / Action Menu */}
                            <div
                              className={`opacity-0 group-hover:opacity-100 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 mx-1.5 ${
                                isMe ? "order-first" : "order-last"
                              }`}
                            >
                              {/* Quick Copy Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg)}
                                title="Copy message"
                                className="p-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 shadow-xs transition-colors cursor-pointer"
                              >
                                {copiedMessageId === msg._id ? (
                                  <Check size={13} className="text-teal-600" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>

                              {/* Own Message Actions: Edit & Delete */}
                              {isMe && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(msg)}
                                    title="Edit message"
                                    className="p-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(msg._id)}
                                    title="Delete message"
                                    className="p-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-red-600 dark:hover:text-red-400 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mb-3">
                    <MessageSquare size={28} />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">No messages yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">
                    Welcome to <strong>{activeCommunity.name}</strong>! Start the conversation by sharing a greeting or learning update.
                  </p>
                </div>
              )}

              {/* Floating scroll to bottom pill */}
              {newMessagesBelow > 0 && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="sticky bottom-2 left-1/2 transform -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all animate-bounce cursor-pointer"
                >
                  <ArrowDown size={14} />
                  <span>{newMessagesBelow} new message{newMessagesBelow > 1 ? "s" : ""}</span>
                </button>
              )}

              <div ref={messagesEndRef} />
            </div>


            {/* Typing status indicator */}
            {Object.keys(typingUsers).length > 0 && (
              <div className="px-4 py-1 text-xs text-teal-600 dark:text-teal-400 bg-gray-50 dark:bg-gray-800/40 italic flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span>
                  {Object.values(typingUsers).join(", ")} {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
                </span>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  const socket = getSocket();
                  if (!isTyping) {
                    setIsTyping(true);
                    socket.emit("community:typing", {
                      communityId: activeCommunity._id,
                      isTyping: true,
                    });
                  }
                  clearTimeout(window.typingTimeout);
                  window.typingTimeout = setTimeout(() => {
                    setIsTyping(false);
                    socket.emit("community:typing", {
                      communityId: activeCommunity._id,
                      isTyping: false,
                    });
                  }, 2000);
                }}
                placeholder={`Message ${activeCommunity.name}...`}
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-1.5 shadow-sm flex-shrink-0 cursor-pointer"
              >
                {sendingMessage ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        ) : (
          /* Communities Cards Grid View */
          <>
            {/* Search & Track Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communities by name, description or track..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Track filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedTrackFilter("All")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedTrackFilter === "All"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All Tracks ({communities.length})
                </button>
                {communityTracks.map((tr) => (
                  <button
                    key={tr}
                    onClick={() => setSelectedTrackFilter(tr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedTrackFilter === tr
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Loader2 className="animate-spin mb-3 text-teal-600" size={32} />
                <p className="text-sm">Loading mentor communities...</p>
              </div>
            ) : filteredCommunities.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCommunities.map((community) => (
                  <div
                    key={community._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                            <BookOpen size={12} />
                            {community.track || "General Track"}
                          </span>
                          {unreadCounts[String(community._id)] > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white flex items-center gap-1 shadow-sm animate-pulse">
                              <Bell size={10} /> {unreadCounts[String(community._id)]} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">

                          <button
                            onClick={() => handleOpenMembersModal(community)}
                            title="Manage Members"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <UserPlus size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCommunity(community)}
                            title="Delete Community"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1.5">
                        {community.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {community.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Users size={14} className="text-teal-600 dark:text-teal-400" />
                        <span className="font-medium">
                          {community.members?.length || 0} student{community.members?.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenChat(community)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        <MessageSquare size={14} />
                        <span>Open Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 mx-auto flex items-center justify-center mb-3">
                  <Users size={32} />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-1">
                  {searchQuery ? "No matching communities found" : "No Communities Created Yet"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  {searchQuery
                    ? "Try adjusting your search query or track filter."
                    : "Create track-focused discussion circles (e.g. Frontend Development, Backend Development) for your assigned students."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Create Your First Community</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* CREATE COMMUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  Create Mentor Community
                </h2>
                <p className="text-xs text-gray-500">
                  Select assigned students to add to this private community circle.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-4 pt-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Community Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Development Community"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Track / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development, Frontend, Mobile..."
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of this community..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Student Selector Section */}
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Select Assigned Students ({formData.selectedStudentIds.length} Selected)
                  </label>

                  <button
                    type="button"
                    onClick={() => selectAllFiltered(modalFilteredStudents)}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                  >
                    {modalFilteredStudents.length > 0 &&
                    modalFilteredStudents.every((s) =>
                      formData.selectedStudentIds.includes(String(s._id))
                    )
                      ? "Deselect Filtered"
                      : "Select All Filtered"}
                  </button>
                </div>

                {/* Modal Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={modalStudentSearch}
                      onChange={(e) => setModalStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <select
                    value={modalTrackFilter}
                    onChange={(e) => setModalTrackFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="All">Filter by Track (All)</option>
                    {studentTracks.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student list checkboxes */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700 bg-gray-50/50 dark:bg-gray-900/40 p-1">
                  {modalFilteredStudents.length ? (
                    modalFilteredStudents.map((student) => {
                      const isSelected = formData.selectedStudentIds.includes(
                        String(student._id)
                      );
                      return (
                        <label
                          key={student._id}
                          className="flex items-center justify-between p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudentSelection(student._id)}
                              className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                            />
                            <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                              {(student.name || "S").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                                {student.name}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-800">
                            {student.batch?.name || student.batch?.track || "Track"}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      No assigned students match your filter.
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Create Community</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE MEMBERS MODAL */}
      {showMembersModal && managingCommunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  Manage Community Members
                </h2>
                <p className="text-xs text-gray-500">
                  {managingCommunity.name} ({formData.selectedStudentIds.length} members selected)
                </p>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 pt-4 flex-1 overflow-y-auto">
              {/* Modal Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assigned students..."
                    value={modalStudentSearch}
                    onChange={(e) => setModalStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <select
                  value={modalTrackFilter}
                  onChange={(e) => setModalTrackFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Tracks</option>
                  {studentTracks.map((tr) => (
                    <option key={tr} value={tr}>
                      {tr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student list checkboxes */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700 bg-gray-50/50 dark:bg-gray-900/40 p-1">
                {modalFilteredStudents.length ? (
                  modalFilteredStudents.map((student) => {
                    const isSelected = formData.selectedStudentIds.includes(
                      String(student._id)
                    );
                    return (
                      <label
                        key={student._id}
                        className="flex items-center justify-between p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentSelection(student._id)}
                            className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                          />
                          <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                            {(student.name || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-800">
                          {student.batch?.name || student.batch?.track || "Track"}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    No assigned students match your filter.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowMembersModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMembers}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Members</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Communities;
