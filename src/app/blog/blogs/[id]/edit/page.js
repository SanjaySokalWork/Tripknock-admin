'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Save, CloudUpload, Delete, Close, Add, Search, Launch } from '@mui/icons-material';
import HtmlEditor from '@/components/HtmlEditor';
import LoadingSpinner from '@/components/LoadingSpinner';

// Import a slug generation utility function
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/&/g, '-and-')      // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
};

export default function EditBlog({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;
    const [updated, setUpdated] = useState("");

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMetaSection, setShowMetaSection] = useState(false);
    const [showcategory, setShowcategory] = useState(false);
    const [showTags, setShowTags] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [previewImages, setPreviewImages] = useState([]);

    // Initialize form data
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        image: [],
        category: [],
        tags: [],
        status: 'draft',
        author: '',
        updated_at: '',
        meta: {
            title: '',
            tags: '',
            extra: ''
        }
    });



    const categoryRef = useRef(null);
    const tagRef = useRef(null);
    const [CATEGORY, setCategory] = useState([]);
    const [AUTHOR, setAuthor] = useState([]);

    useEffect(() => {
        document.title = 'Edit Blog - Tripknock';

        // Check if admin token exists and fetch blog data
        try {
            const authCookie = Cookies.get('tk_auth_details');
            if (authCookie) {
                // Fetch blog data, categories, and authors
                fetchCategories();
                fetchBloggers();
                fetchBlogData();
            } else {
                alert('Authentication required. Please log in as an admin.');
                router.push('/login');
            }
        } catch (error) {
            console.log('Error checking authentication:', error);
            alert('Authentication error. Please log in again.');
            router.push('/login');
        }

        function handleClickOutside(event) {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setShowcategory(false);
            }
            if (tagRef.current && !tagRef.current.contains(event.target)) {
                setShowTags(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchBlogData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/blog/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch blog data');
            }

            const data = await response.json();

            // Parse category and tags if they are strings
            let categoryData = data.category;
            let tagsData = data.tags;
            let metaData = data.meta || {};

            if (typeof categoryData === 'string') {
                try {
                    categoryData = JSON.parse(categoryData);
                } catch (e) {
                    console.log('Error parsing category data:', e);
                    categoryData = [];
                }
            }

            if (typeof tagsData === 'string') {
                try {
                    tagsData = JSON.parse(tagsData);
                } catch (e) {
                    console.log('Error parsing tags data:', e);
                    tagsData = [];
                }
            }

            if (typeof metaData === 'string') {
                try {
                    metaData = JSON.parse(metaData);
                } catch (e) {
                    console.log('Error parsing meta data:', e);
                    metaData = {
                        title: '',
                        tags: '',
                        extra: ''
                    };
                }
            }

            // Set form data with blog details
            setFormData({
                title: data.title || '',
                slug: data.slug || '',
                content: data.content || '',
                image: data.image || null,
                category: Array.isArray(categoryData) ? categoryData : [],
                tags: Array.isArray(tagsData) ? tagsData : [],
                status: data.status || 'draft',
                author: data.author || '',
                updated_at: data.updated_at || '',
                meta: {
                    title: metaData.title || '',
                    tags: metaData.tags || '',
                    extra: metaData.extra || ''
                }
            });
            setUpdated(data.slug || '');

            // Set preview image if available
            if (data.image) {
                setPreviewImages([`http://localhost:5000/uploads/${data.image}`]);
            }

            setLoading(false);
        } catch (error) {
            console.log('Error fetching blog data:', error);
            alert('Failed to fetch blog data. Please try again.');
            router.push('/blog/blogs');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/blog/categories/all');
            if (response.ok) {
                const data = await response.json();
                // Transform data to match the expected format
                const formattedCategories = data.map(category => ({
                    label: category.name,
                    value: category.slug
                }));
                setCategory(formattedCategories);
            } else {
                console.log('Failed to fetch categories');
            }
        } catch (error) {
            console.log('Error fetching categories:', error);
        }
    };

    const fetchBloggers = async () => {
        try {
            const response = await fetch('http://localhost:5000/user/by-role/blogger');
            if (response.ok) {
                const data = await response.json();
                // Transform data to match the expected format
                const formattedAuthors = data.map(user => ({
                    label: user.label,
                    value: user.value
                }));
                setAuthor(formattedAuthors);
            } else {
                console.log('Failed to fetch bloggers');
            }
        } catch (error) {
            console.log('Error fetching bloggers:', error);
        }
    };

    // Auto-generate slug when title changes
    useEffect(() => {
        if (formData.title && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: generateSlug(prev.title)
            }));
        }
    }, [formData.title]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // If manually changing the slug, validate it
        if (name === 'slug') {
            const validatedSlug = generateSlug(value);
            if (validatedSlug !== value) {
                setFormData(prev => ({
                    ...prev,
                    slug: validatedSlug
                }));
            }
        }
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (status) => {
        setIsSubmitting(true);

        try {
            // Prepare form data for submission
            const blogFormData = new FormData();
            blogFormData.append('title', formData.title);
            blogFormData.append('slug', formData.slug);
            blogFormData.append('content', formData.content);
            blogFormData.append('category', JSON.stringify(formData.category));
            blogFormData.append('tags', JSON.stringify(formData.tags));
            blogFormData.append('status', status || formData.status);
            blogFormData.append('author', formData.author);
            blogFormData.append('meta', JSON.stringify({
                title: formData.meta.title,
                tags: formData.meta.tags,
                extra: formData.meta.extra
            }));

            // Append image if available
            if (Array.isArray(formData.image) && formData.image.length > 0) {
                blogFormData.append('image', formData.image[0]);
            } else {
                blogFormData.append('image', formData.image);
            }

            // Send request to backend
            const response = await fetch(`http://localhost:5000/blog/update/${id}`, {
                method: 'POST',
                headers: {
                    'admin': JSON.parse(Cookies.get('tk_auth_details')).email
                },
                body: blogFormData
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/blog/blogs');
            } else {
                console.log('Error updating blog:', data.message);
                alert(`Failed to update blog: ${data.message}`);
            }
        } catch (error) {
            console.log('Error updating blog:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                image: files
            }));

            // Create preview URL
            const previewUrl = URL.createObjectURL(files[0]);
            setPreviewImages([previewUrl]);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            image: []
        }));

        // Clear preview images and revoke object URLs to prevent memory leaks
        previewImages.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        setPreviewImages([]);
    };

    const handleMetaChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            meta: {
                ...prev.meta,
                [name]: value
            }
        }));
    };

    return (
        <>
            {loading || isSubmitting ? (
                <LoadingSpinner />
            ) : (
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary-900">Edit Blog</h1>
                            <p className="text-secondary-600 mb-1">Update your blog post</p>
                            {formData.status === 'draft' && (
                                <p className="text-yellow-600 text-xs">Draft at {formData.updated_at}</p>
                            )}
                            {formData.status === 'published' && (
                                <p className="text-green-600 text-xs">Published at {formData.updated_at}</p>
                            )}
                            <a target="_blank" className="inline-block hover:underline text-primary-600 text-sm mt-1" rel="noopener noreferrer" href={`https://www.tripknock.com/blog/${updated}`}>
                                https://www.tripknock.com/blog/{updated} <Launch className='ml-1 w-4 h-4' />
                            </a>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/blog/blogs')}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Close className="w-5 h-5" />
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmit('draft')}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSubmit('published')}
                                className="btn-primary flex items-center gap-2"
                            >
                                <CloudUpload className="w-5 h-5" />
                                Publish
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Author
                                    </label>
                                    <select
                                        name="author"
                                        className="input-field w-full"
                                        value={formData.author}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Author</option>
                                        {AUTHOR.map((author, index) => (
                                            <option key={index} value={author.value}>
                                                {author.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="input-field w-full"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter title"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Slug <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        className="input-field w-full"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="enter-url-slug"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Meta Tags Section */}
                            <div className="mt-6 mb-6 border border-secondary-200 rounded-lg">
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none"
                                    onClick={() => setShowMetaSection(!showMetaSection)}
                                >
                                    <span>Advanced SEO Options (Optional)</span>
                                    <svg
                                        className={`h-5 w-5 text-secondary-500 transform ${showMetaSection ? 'rotate-180' : ''} transition-transform duration-200`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {showMetaSection && (
                                    <div className="px-4 py-3 border-t border-secondary-200 space-y-4">
                                        {/* <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                                Meta Title
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.meta.title}
                                                onChange={handleMetaChange}
                                                className="input-field w-full"
                                                placeholder="Meta Title"
                                            />
                                        </div> */}

                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                                Meta Description
                                            </label>
                                            <input
                                                type="text"
                                                name="tags"
                                                value={formData.meta.tags}
                                                onChange={handleMetaChange}
                                                className="input-field w-full"
                                                placeholder="Meta Description"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                                Additional Tags
                                            </label>
                                            <textarea
                                                name="extra"
                                                value={formData.meta.extra}
                                                onChange={handleMetaChange}
                                                className="input-field w-full h-24 resize-none"
                                                placeholder="Additional tags (HTML)"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-2 grid-cols-2 gap-6">
                                <div className="relative col-span-1" ref={categoryRef}>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Categories
                                    </label>
                                    {formData.category.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.category.map(categoryValue => {
                                                const categoryLabel = CATEGORY.find(c => c.value === categoryValue)?.label || categoryValue;
                                                return (
                                                    <span
                                                        key={categoryValue}
                                                        className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm flex items-center gap-1"
                                                    >
                                                        {categoryLabel}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMultiSelect('category', formData.category.filter(c => c !== categoryValue))}
                                                            className="text-secondary-500 hover:text-secondary-700"
                                                        >
                                                            <Close className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            onFocus={() => setShowcategory(true)}
                                            className="input-field w-full pr-10"
                                            placeholder="Search categories..."
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <Search className="h-5 w-5 text-secondary-400" />
                                        </div>
                                        {showcategory && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                                {CATEGORY
                                                    .filter(
                                                        category =>
                                                            category.label.toLowerCase().includes(categorySearch.toLowerCase()) &&
                                                            !formData.category.includes(category.value)
                                                    )
                                                    .map((category, index) => (
                                                        <div
                                                            key={index}
                                                            className="px-4 py-2 hover:bg-secondary-50 cursor-pointer flex items-center"
                                                            onClick={() => {
                                                                if (!formData.category.includes(category.value)) {
                                                                    handleMultiSelect('category', [...formData.category, category.value]);
                                                                    setCategorySearch('');
                                                                }
                                                            }}
                                                        >
                                                            <Search className="w-4 h-4 mr-2 text-secondary-400" />
                                                            {category.label}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="relative col-span-1" ref={tagRef}>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(formData.tags && Array.isArray(formData.tags) ? formData.tags : []).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm flex items-center gap-1"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleMultiSelect('tags', formData.tags.filter((_, i) => i !== index))}
                                                    className="text-secondary-500 hover:text-secondary-700"
                                                >
                                                    <Close className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Add a tag and press Enter"
                                            className="input-field w-full"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && tagInput.trim()) {
                                                    e.preventDefault();
                                                    if (!formData.tags.includes(tagInput.trim())) {
                                                        handleMultiSelect('tags', [...formData.tags, tagInput.trim()]);
                                                    }
                                                    setTagInput('');
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image Upload */}
                            <div className="mt-6 mb-6">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Featured Image
                                </label>
                                <div className="mb-4">
                                    {previewImages.length > 0 ? (
                                        <div className="relative mt-2 mb-4">
                                            <div className="relative w-full h-48 overflow-hidden rounded-lg border border-secondary-200">
                                                <img
                                                    src={previewImages[0]}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-secondary-100"
                                                >
                                                    <Close className="w-5 h-5 text-secondary-700" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-secondary-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div className="flex text-sm text-secondary-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/*"
                                                            onChange={handleFileChange}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-secondary-500">
                                                    PNG, JPG, GIF up to 10MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Content <span className="text-red-500">*</span>
                                </label>
                                <HtmlEditor
                                    value={formData.content}
                                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6 justify-end">
                        <button
                            onClick={() => router.push('/blog/blogs')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Close className="w-5 h-5" />
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSubmit('draft')}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSubmit('published')}
                            className="btn-primary flex items-center gap-2"
                        >
                            <CloudUpload className="w-5 h-5" />
                            Publish
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
