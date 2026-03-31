// pages/admin/AdminBlogManagement.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  StarOff,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  Archive,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  Tag,
  Folder,
} from "lucide-react";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import RichTextEditor from "../../components/RichTextEditor";

// ─── Tiny helpers ───────────────────────────────────────────────────────────
const statusBadge = (status) => {
  const map = {
    PUBLISHED: "bg-green-100 text-green-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };
  return map[status] || map.DRAFT;
};

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  imageAlt: "",
  category: "",
  tags: [],
  status: "DRAFT",
  featured: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

// ─── Main component ──────────────────────────────────────────────────────────
const AdminBlogManagement = () => {
  // List view state
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Editor view state
  const [view, setView] = useState("list"); // 'list' | 'create' | 'edit'
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const featuredImageRef = useRef(null);

  // Tab state within editor
  const [editorTab, setEditorTab] = useState("content"); // 'content' | 'seo'

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view === "list") {
      fetchPosts();
    }
  }, [currentPage, searchQuery, statusFilter, view]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.adminGetBlogPosts,
        params: {
          page: currentPage,
          limit: 10,
          ...(searchQuery && { search: searchQuery }),
          ...(statusFilter && { status: statusFilter }),
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      if (response.data.success) {
        setPosts(response.data.data);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("fetchPosts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await Axios({ ...SummaryApi.adminGetBlogCategories });
      if (res.data.success) setCategories(res.data.data);
    } catch (_) {}
  };

  const fetchTags = async () => {
    try {
      const res = await Axios({ ...SummaryApi.adminGetBlogTags });
      if (res.data.success) setTags(res.data.data);
    } catch (_) {}
  };

  // ── Editor helpers ────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setEditingPost(null);
    setEditorTab("content");
    setView("create");
  };

  const openEdit = (post) => {
    setForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featuredImage: post.featuredImage || "",
      imageAlt: post.imageAlt || "",
      category: post.category?._id || "",
      tags: post.tags?.map((t) => t._id) || [],
      status: post.status || "DRAFT",
      featured: post.featured || false,
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      seoKeywords: post.seoKeywords || "",
    });
    setEditingPost(post);
    setEditorTab("content");
    setView("edit");
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  // ── Featured image upload ─────────────────────────────────────────────────
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setImageUploading(true);
      const res = await Axios({
        ...SummaryApi.uploadImage,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        const url = res.data.data?.secure_url || res.data.data?.url;
        handleFormChange("featuredImage", url);
      }
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  // ── Save (create / update) ────────────────────────────────────────────────
  const handleSave = async (publishNow = false) => {
    if (
      !form.title.trim() ||
      !form.excerpt.trim() ||
      !form.content ||
      !form.featuredImage ||
      !form.category
    ) {
      alert(
        "Please fill in: title, excerpt, content, featured image, and category.",
      );
      return;
    }

    const payload = {
      ...form,
      status: publishNow ? "PUBLISHED" : form.status,
    };

    try {
      setSaving(true);
      let res;
      if (view === "edit" && editingPost) {
        res = await Axios({
          ...SummaryApi.adminUpdateBlogPost,
          url: `${SummaryApi.adminUpdateBlogPost.url}/${editingPost._id}`,
          data: payload,
        });
      } else {
        res = await Axios({
          ...SummaryApi.adminCreateBlogPost,
          data: payload,
        });
      }

      if (res.data.success) {
        setView("list");
        fetchPosts();
      }
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`))
      return;
    try {
      await Axios({
        ...SummaryApi.adminDeleteBlogPost,
        url: `${SummaryApi.adminDeleteBlogPost.url}/${post._id}`,
      });
      fetchPosts();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  // ── Toggle featured ───────────────────────────────────────────────────────
  const handleToggleFeatured = async (post) => {
    try {
      await Axios({
        url: `/api/blog/admin/posts/${post._id}/toggle-featured`,
        method: "patch",
      });
      fetchPosts();
    } catch (err) {
      alert("Failed to toggle featured");
    }
  };

  // ── Quick status toggle ───────────────────────────────────────────────────
  const handleStatusChange = async (post, newStatus) => {
    try {
      await Axios({
        ...SummaryApi.adminUpdateBlogPost,
        url: `${SummaryApi.adminUpdateBlogPost.url}/${post._id}`,
        data: { status: newStatus },
      });
      fetchPosts();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ─────────────────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Blog Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage blog posts
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No posts found. Create your first blog post!</p>
              <button
                onClick={openCreate}
                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Post
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">
                      Featured
                    </th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr
                      key={post._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {post.featuredImage && (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                        {post.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={post.status}
                          onChange={(e) =>
                            handleStatusChange(post, e.target.value)
                          }
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:ring-1 focus:ring-amber-400 ${statusBadge(post.status)}`}
                        >
                          <option value="PUBLISHED">Published</option>
                          <option value="DRAFT">Draft</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <button
                          onClick={() => handleToggleFeatured(post)}
                          title={
                            post.featured
                              ? "Remove from featured"
                              : "Mark as featured"
                          }
                          className={
                            post.featured
                              ? "text-amber-500 hover:text-amber-700"
                              : "text-gray-300 hover:text-amber-400"
                          }
                        >
                          {post.featured ? (
                            <Star size={18} fill="currentColor" />
                          ) : (
                            <Star size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {post.status === "PUBLISHED" && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View post"
                            >
                              <Eye size={15} />
                            </a>
                          )}
                          <button
                            onClick={() => openEdit(post)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE / EDIT VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("list")}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {view === "edit" ? "Edit Post" : "New Blog Post"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {view === "edit"
                ? editingPost?.title
                : "Fill in the details below"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            <Save size={15} />
            {form.status === "DRAFT" ? "Save Draft" : "Save"}
          </button>
          {form.status !== "PUBLISHED" && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
            >
              <CheckCircle size={15} />
              {saving ? "Publishing…" : "Publish Now"}
            </button>
          )}
          {form.status === "PUBLISHED" && (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
            >
              <CheckCircle size={15} />
              {saving ? "Updating…" : "Update Post"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left column: main content ───────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <input
              type="text"
              placeholder="Post title…"
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              className="w-full text-2xl font-bold placeholder-gray-300 focus:outline-none text-gray-800 border-0"
            />
            <p className="text-xs text-gray-400 mt-2">
              {form.title.length}/200 characters
            </p>
          </div>

          {/* Tabs: Content / SEO */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {["content", "seo"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEditorTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${
                    editorTab === tab
                      ? "border-b-2 border-amber-600 text-amber-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "content" ? "Content & Excerpt" : "SEO Settings"}
                </button>
              ))}
            </div>

            {editorTab === "content" ? (
              <div className="p-5 space-y-5">
                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Excerpt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) =>
                      handleFormChange("excerpt", e.target.value)
                    }
                    rows={3}
                    maxLength={300}
                    placeholder="A short summary shown in blog listings and social shares…"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.excerpt.length}/300
                  </p>
                </div>

                {/* Rich text body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(html) => handleFormChange("content", html)}
                  />
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) =>
                      handleFormChange("seoTitle", e.target.value)
                    }
                    placeholder="Leave blank to use post title"
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.seoTitle.length}/60
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) =>
                      handleFormChange("seoDescription", e.target.value)
                    }
                    rows={3}
                    placeholder="Leave blank to use excerpt"
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {form.seoDescription.length}/160
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Focus Keywords
                  </label>
                  <input
                    type="text"
                    value={form.seoKeywords}
                    onChange={(e) =>
                      handleFormChange("seoKeywords", e.target.value)
                    }
                    placeholder="coffee, brewing, ethiopia (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                {/* Live preview of search snippet */}
                {(form.seoTitle || form.title) && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Google Preview
                    </p>
                    <p className="text-blue-700 text-base line-clamp-1">
                      {form.seoTitle || form.title}
                    </p>
                    <p className="text-green-700 text-xs mt-0.5">
                      icvng.com › blog ›{" "}
                      {form.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .slice(0, 40)}
                    </p>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {form.seoDescription || form.excerpt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Publish settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              Publish Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    Featured Post
                  </p>
                  <p className="text-xs text-gray-400">Show on homepage</p>
                </div>
                <button
                  onClick={() => handleFormChange("featured", !form.featured)}
                  className={`transition-colors ${form.featured ? "text-amber-500" : "text-gray-300 hover:text-amber-300"}`}
                >
                  <Star
                    size={22}
                    fill={form.featured ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Featured image */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-600" />
              Featured Image <span className="text-red-500">*</span>
            </h3>

            <input
              ref={featuredImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFeaturedImageUpload}
            />

            {form.featuredImage ? (
              <div className="relative group">
                <img
                  src={form.featuredImage}
                  alt={form.imageAlt || "Featured"}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => featuredImageRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-gray-800 rounded text-xs font-medium hover:bg-gray-100"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => handleFormChange("featuredImage", "")}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => featuredImageRef.current?.click()}
                disabled={imageUploading}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
              >
                {imageUploading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Upload size={22} />
                    <span className="text-sm">Click to upload</span>
                    <span className="text-xs">JPG, PNG, WEBP — max 10MB</span>
                  </>
                )}
              </button>
            )}

            {form.featuredImage && (
              <input
                type="text"
                value={form.imageAlt}
                onChange={(e) => handleFormChange("imageAlt", e.target.value)}
                placeholder="Alt text for accessibility…"
                className="mt-2 w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Folder size={16} className="text-amber-600" />
              Category <span className="text-red-500">*</span>
            </h3>
            <select
              value={form.category}
              onChange={(e) => handleFormChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            >
              <option value="">Select category…</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-amber-600" />
              Tags
            </h3>
            {tags.length === 0 ? (
              <p className="text-xs text-gray-400">No tags available.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag._id}
                    onClick={() => toggleTag(tag._id)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                      form.tags.includes(tag._id)
                        ? "text-white border-transparent shadow-sm scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                    style={
                      form.tags.includes(tag._id)
                        ? { backgroundColor: tag.color || "#6b7280" }
                        : {}
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogManagement;
