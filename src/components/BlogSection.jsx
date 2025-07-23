// client/src/components/BlogSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Clock, Coffee } from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

/**
 * Blog section component for homepage featuring latest blog posts
 */
const BlogSection = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeaturedPosts();
  }, []);

  const fetchFeaturedPosts = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getFeaturedBlogPosts,
        params: { limit: 8 }, // Get more posts for the 4-column layout
      });

      if (response.data.success) {
        setFeaturedPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      // Fallback data for development - mark all as featured
      setFeaturedPosts([
        {
          _id: '1',
          title: 'The Ethiopian Coffee Story: Birthplace of Coffee',
          excerpt:
            'Discover the legendary birthplace of coffee in the highlands of Ethiopia, where coffee culture began over a thousand years ago.',
          featuredImage:
            'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop',
          slug: 'ethiopian-coffee-story-birthplace-of-coffee',
          category: { name: 'Coffee Origins', slug: 'coffee-origins' },
          author: { name: 'Coffee Expert' },
          publishedAt: new Date().toISOString(),
          readTime: 5,
          views: 1250,
          featured: true,
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
          author: { name: 'Coffee Expert' },
          publishedAt: new Date().toISOString(),
          readTime: 7,
          views: 980,
          featured: true,
        },
        {
          _id: '3',
          title: "Jamaica Blue Mountain: The World's Most Expensive Coffee",
          excerpt:
            'Uncover the secrets behind Jamaica Blue Mountain coffee, one of the rarest and most sought-after coffees in the world.',
          featuredImage:
            'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&h=400&fit=crop',
          slug: 'jamaica-blue-mountain-worlds-most-expensive-coffee',
          category: { name: 'Coffee Origins', slug: 'coffee-origins' },
          author: { name: 'Coffee Expert' },
          publishedAt: new Date().toISOString(),
          readTime: 6,
          views: 1450,
          featured: true,
        },
        {
          _id: '4',
          title: 'Brazilian Coffee: The Giant of Global Coffee Production',
          excerpt:
            "Learn about Brazil's dominance in the coffee world and the diverse regions that produce everything from commodity to specialty grade beans.",
          featuredImage:
            'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop',
          slug: 'brazilian-coffee-giant-global-production',
          category: { name: 'Coffee Origins', slug: 'coffee-origins' },
          author: { name: 'Coffee Expert' },
          publishedAt: new Date().toISOString(),
          readTime: 8,
          views: 890,
          featured: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const BlogCard = ({ post, featured = false }) => (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={post.featuredImage}
          alt={post.imageAlt || post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
            {post.category?.name || 'Blog'}
          </span>
        </div>
        {post.featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
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
            <span>{post.readTime} min read</span>
          </div>
        </div>

        <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-amber-700 font-medium group-hover:text-amber-800 transition-colors">
            <span className="text-sm">Read More</span>
            <ArrowRight
              size={16}
              className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
            />
          </div>
          {post.views && (
            <span className="text-xs text-gray-400">{post.views} views</span>
          )}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Coffee className="w-8 h-8 text-amber-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Coffee Stories & Insights
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Dive deep into the world of coffee with expert insights, origin
            stories, and brewing techniques from our coffee enthusiasts.
          </p>
        </div>

        {featuredPosts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {featuredPosts.map((post, index) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/blog"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Explore All Stories</span>
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </>
        )}

        {featuredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No blog posts available
            </h3>
            <p className="text-gray-500">
              Check back soon for exciting coffee stories and insights!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
