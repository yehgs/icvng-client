// client/src/pages/BlogPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Coffee,
  Grid,
  List,
  ChevronDown,
  X,
} from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    selectedTag,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params);
  }, [
    searchQuery,
    selectedCategory,
    selectedTag,
    currentPage,
    setSearchParams,
  ]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedTag && { tag: selectedTag }),
        sortBy,
        sortOrder,
      };

      const response = await Axios({
        ...SummaryApi.getBlogPosts,
        params,
      });

      if (response.data.success) {
        setPosts(response.data.data);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback data for development
      setPosts([
        {
          _id: '1',
          title: 'The Ethiopian Coffee Story: Birthplace of Coffee',
          excerpt:
            'Discover the legendary birthplace of coffee in the highlands of Ethiopia, where coffee culture began over a thousand years ago.',
          featuredImage:
            'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop',
          slug: 'ethiopian-coffee-story-birthplace-of-coffee',
          category: { name: 'Coffee Origins', slug: 'coffee-origins' },
          tags: [
            { name: 'Ethiopia', color: '#DC143C' },
            { name: 'Arabica', color: '#8B4513' },
          ],
          author: { name: 'Coffee Expert' },
          publishedAt: new Date().toISOString(),
          readTime: 5,
          views: 1250,
        },
        {
          _id: '2',
          title: 'Colombian Coffee: The Perfect Climate for Perfect Beans',
          excerpt:
            "Explore how Colombia's unique geography and climate create some of the world's most beloved coffee beans.",
          featuredImage:
            'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=600&h=400&fit=crop',
          slug: 'colombian-coffee-perfect-climate-perfect-beans',
          category: { name: 'Coffee Origins', slug: 'coffee-origins' },
          tags: [
            { name: 'Colombia', color: '#FFD700' },
            { name: 'Fair Trade', color: '#32CD32' },
          ],
          author: { name: 'Coffee Expert' },
          publishedAt: new Date().toISOString(),
          readTime: 7,
          views: 980,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getBlogCategories,
      });

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        {
          _id: '1',
          name: 'Coffee Origins',
          slug: 'coffee-origins',
          postCount: 10,
        },
        {
          _id: '2',
          name: 'Brewing Techniques',
          slug: 'brewing-techniques',
          postCount: 8,
        },
        {
          _id: '3',
          name: 'Coffee Culture',
          slug: 'coffee-culture',
          postCount: 6,
        },
      ]);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getBlogTags,
      });

      if (response.data.success) {
        setTags(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([
        { _id: '1', name: 'Arabica', color: '#8B4513', postCount: 5 },
        { _id: '2', name: 'Ethiopia', color: '#DC143C', postCount: 3 },
        { _id: '3', name: 'Colombia', color: '#FFD700', postCount: 4 },
      ]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const BlogCard = ({ post, mode }) => (
    <div
      className={`group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
        mode === 'list' ? 'flex gap-4' : 'transform hover:-translate-y-1'
      }`}
    >
      <Link
        to={`/blog/${post.slug}`}
        className={`block ${mode === 'list' ? 'w-1/3 flex-shrink-0' : ''}`}
      >
        <div
          className={`relative overflow-hidden ${
            mode === 'list' ? 'h-full' : 'h-48'
          }`}
        >
          <img
            src={post.featuredImage}
            alt={post.imageAlt || post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-block px-2 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
              {post.category?.name}
            </span>
          </div>
        </div>
      </Link>

      <div className={`p-4 ${mode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{post.author?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.readTime} min</span>
          </div>
        </div>

        <Link to={`/blog/${post.slug}`}>
          <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
          {post.excerpt}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag._id || tag.name}
                className="inline-block px-2 py-1 text-xs rounded-full text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            to={`/blog/${post.slug}`}
            className="flex items-center text-amber-700 font-medium hover:text-amber-800 transition-colors"
          >
            <span className="text-sm">Read More</span>
            <ArrowRight
              size={16}
              className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
          {post.views && (
            <span className="text-xs text-gray-400">{post.views} views</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Coffee className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">Coffee Blog</h1>
          </div>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Stories, insights, and knowledge from the world of coffee
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search coffee stories, origins, brewing techniques..."
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-amber-100 text-amber-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-amber-100 text-amber-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">
                          {category.postCount}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Popular Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag._id}
                      onClick={() =>
                        setSelectedTag(selectedTag === tag.slug ? '' : tag.slug)
                      }
                      className={`px-3 py-1 text-xs rounded-full transition-all ${
                        selectedTag === tag.slug
                          ? 'text-white shadow-md transform scale-105'
                          : 'text-white hover:shadow-md hover:scale-105'
                      }`}
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="publishedAt-desc">Latest First</option>
                  <option value="publishedAt-asc">Oldest First</option>
                  <option value="views-desc">Most Popular</option>
                  <option value="title-asc">Title A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">
                  {posts.length} posts found
                </span>
                {(searchQuery || selectedCategory || selectedTag) && (
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery('')}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Posts Grid/List */}
            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg overflow-hidden shadow-md"
                  >
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  }`}
                >
                  {posts.map((post) => (
                    <BlogCard key={post._id} post={post} mode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-amber-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or browse all posts.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
