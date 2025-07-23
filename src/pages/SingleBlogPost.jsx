// client/src/pages/SingleBlogPost.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  Clock,
  Eye,
  Share2,
  Heart,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft,
  ArrowRight,
  Coffee,
  Tag,
  ChevronRight,
} from 'lucide-react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const SingleBlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      fetchRelatedPosts();
      // Add structured data for SEO
      addStructuredData();
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getBlogPostBySlug,
        url: `${SummaryApi.getBlogPostBySlug.url}/${slug}`,
      });

      if (response.data.success) {
        setPost(response.data.data);
        // Update page metadata
        updatePageMetadata(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      // Fallback data for development
      setPost({
        _id: '1',
        title: 'The Ethiopian Coffee Story: Birthplace of Coffee',
        excerpt:
          'Discover the legendary birthplace of coffee in the highlands of Ethiopia, where coffee culture began over a thousand years ago.',
        content: `
          <h2>The Legend of Kaldi and the Dancing Goats</h2>
          <p>The story of coffee begins in the ancient highlands of Ethiopia, where legend tells of a goat herder named Kaldi who noticed his goats becoming unusually energetic after eating certain red berries. This discovery would eventually change the world forever.</p>
          
          <h3>Ethiopian Coffee Regions</h3>
          <p>Ethiopia produces some of the world's finest coffee beans, with distinct regions offering unique flavor profiles:</p>
          <ul>
            <li><strong>Yirgacheffe:</strong> Known for its bright acidity and floral notes</li>
            <li><strong>Sidamo:</strong> Full-bodied with wine-like characteristics</li>
            <li><strong>Harrar:</strong> Bold and earthy with berry undertones</li>
          </ul>
          
          <h3>Traditional Coffee Ceremony</h3>
          <p>The Ethiopian coffee ceremony is a beautiful tradition that brings communities together. Green coffee beans are roasted over an open flame, ground by hand, and brewed in a clay pot called a jebena. This ritual can take hours and represents hospitality and friendship.</p>
        `,
        featuredImage:
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&h=600&fit=crop',
        imageAlt: 'Ethiopian coffee ceremony with traditional jebena pot',
        slug: 'ethiopian-coffee-story-birthplace-of-coffee',
        category: { name: 'Coffee Origins', slug: 'coffee-origins' },
        tags: [
          { name: 'Ethiopia', color: '#DC143C', slug: 'ethiopia' },
          { name: 'Arabica', color: '#8B4513', slug: 'arabica' },
          { name: 'Single Origin', color: '#228B22', slug: 'single-origin' },
        ],
        author: {
          name: 'Coffee Expert',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        },
        publishedAt: new Date().toISOString(),
        readTime: 5,
        views: 1250,
        likes: 42,
        seoTitle:
          'Ethiopian Coffee Origins - The Birthplace of Coffee | I-Coffee.ng',
        seoDescription:
          'Learn about Ethiopian coffee origins, from the legend of Kaldi to modern coffee regions like Yirgacheffe and Sidamo.',
        relatedProducts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getRelatedBlogPosts,
        url: `${SummaryApi.getRelatedBlogPosts.url}/${post._id}/related`,
        params: { limit: 3 },
      });

      if (response.data.success) {
        setRelatedPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
      setRelatedPosts([
        {
          _id: '2',
          title: 'Colombian Coffee: The Perfect Climate for Perfect Beans',
          excerpt:
            "Explore how Colombia's unique geography and climate create some of the world's most beloved coffee beans.",
          featuredImage:
            'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=400&h=300&fit=crop',
          slug: 'colombian-coffee-perfect-climate-perfect-beans',
          readTime: 7,
        },
      ]);
    }
  };

  const updatePageMetadata = (postData) => {
    // Update document title
    document.title =
      postData.seoTitle || `${postData.title} | I-Coffee.ng Blog`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        postData.seoDescription || postData.excerpt
      );
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (ogTitle)
      ogTitle.setAttribute('content', postData.socialTitle || postData.title);
    if (ogDescription)
      ogDescription.setAttribute(
        'content',
        postData.socialDescription || postData.excerpt
      );
    if (ogImage)
      ogImage.setAttribute(
        'content',
        postData.socialImage || postData.featuredImage
      );
  };

  const addStructuredData = () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.featuredImage,
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'I-Coffee.ng',
        logo: {
          '@type': 'ImageObject',
          url: 'https://i-coffee.ng/logo.png',
        },
      },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://i-coffee.ng/blog/${post.slug}`,
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post.title;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShareMenuOpen(false);
  };

  const handleLike = () => {
    setLiked(!liked);
    // In a real app, you would send this to your API
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-96 bg-gray-200 animate-pulse"></div>
              <div className="p-8 space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Post Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-amber-600">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/blog" className="text-gray-500 hover:text-amber-600">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              to={`/blog/category/${post.category.slug}`}
              className="text-gray-500 hover:text-amber-600"
            >
              {post.category.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-800 truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          {/* Main Article */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-96 md:h-[500px] overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.imageAlt || post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block px-3 py-1 bg-amber-600 text-white text-sm font-semibold rounded-full mb-4">
                  {post.category.name}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {post.title}
                </h1>
                <p className="text-xl text-gray-200 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </div>

            {/* Article Meta */}
            <div className="p-6 md:p-8 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-gray-800">
                        {post.author.name}
                      </div>
                      <div className="text-sm text-gray-600">Author</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      liked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
                    />
                    <span>{post.likes + (liked ? 1 : 0)}</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShareMenuOpen(!shareMenuOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>

                    {shareMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                        <div className="py-2">
                          <button
                            onClick={() => handleShare('facebook')}
                            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50"
                          >
                            <Facebook className="w-4 h-4 text-blue-600" />
                            <span>Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50"
                          >
                            <Twitter className="w-4 h-4 text-blue-400" />
                            <span>Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50"
                          >
                            <Linkedin className="w-4 h-4 text-blue-700" />
                            <span>LinkedIn</span>
                          </button>
                          <button
                            onClick={() => handleShare('copy')}
                            className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50"
                          >
                            <Share2 className="w-4 h-4 text-gray-600" />
                            <span>Copy Link</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 md:p-8">
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-amber-600 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="p-6 md:p-8 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-800">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag._id || tag.name}
                      to={`/blog/tag/${tag.slug}`}
                      className="inline-block px-3 py-1 text-sm rounded-full text-white hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost._id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center text-amber-700 font-medium">
                        <span className="text-sm">Read More</span>
                        <ArrowRight
                          size={16}
                          className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleBlogPost;
