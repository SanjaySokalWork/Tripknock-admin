'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Public, Close, CloudUpload } from '@mui/icons-material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import HtmlEditor from '@/components/HtmlEditor';
import Select from 'react-select';
import Cookies from 'js-cookie';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

const TABS = [
  { id: 'introduction', label: 'Basic Intro' },
  { id: 'basic', label: 'Basic Information' },
  { id: 'packages', label: 'Popular Destination' },
  { id: 'description', label: 'Destination Description' },
  { id: 'review', label: 'Review' },
];

export default function CreateDestination() {
  const router = useRouter();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();
  const { setLoading, isLoading, showGlobalLoading, hideGlobalLoading } = useLoading();

  const [activeTab, setActiveTab] = useState('introduction');
  const [popularOptions, setPopularOptions] = useState([]);
  const [mainOptions, setMainOptions] = useState([]);
  const [showMetaSection, setShowMetaSection] = useState(false);
  const [error, setError] = useState({ type: '', message: '' });
  const [themes, setThemes] = useState([]);

  const [formData, setFormData] = useState({
    // Basic Information
    metaTitle: '',
    metaTags: '',
    extraMetaTags: '',
    category: '',
    fromDestination: '',
    destinationName: '',
    country: 'India',
    destinationHeading: '',
    images: [],
    urlSlug: '',
    description: '',
    destinationImage: [],

    // Popular Packages
    popularPackages: [],
    mainPackages: [],

    // Destination Description
    detailedDescription: '',
    faqs: [
      {
        question: '',
        answer: ''
      }
    ]
  });

  const sectionRef = useRef(null);

  const scrollToTop = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Fetch themes from backend
  const fetchThemes = async () => {
    try {
      const response = await fetch('https://data.tripknock.in/theme/all');
      const themesData = await response.json();
      if (themesData && Array.isArray(themesData)) {
        setThemes(themesData);
      }
    } catch (error) {
      console.log('Error fetching themes:', error);
    }
  };

  // Fetch tour options
  useEffect(() => {
    document.title = 'Create Theme Page - Tripknock';
    setLoading('fetchData', true, 'Loading data...');

    const fetchTours = async () => {
      try {
        // Mock tour data - replace with actual API call
        let mockTours = [
          { value: 'Kashmir Valley Tour', label: 'Kashmir Valley Tour' },
          { value: 'Gulmarg Skiing Adventure', label: 'Gulmarg Skiing Adventure' },
          { value: 'Ladakh Explorer', label: 'Ladakh Explorer' },
          { value: 'Kerala Backwaters', label: 'Kerala Backwaters' },
          { value: 'Rajasthan Heritage Tour', label: 'Rajasthan Heritage Tour' }
        ];

        async function fetchData() {
          let res = await fetch("https://data.tripknock.in/themes-pages/load");
          let data = await res.json();
          // For Popular Destination, use destinations
          if (data.destinations) {
            let mockDestinations = [];
            data.destinations.map(ele => mockDestinations.push({ value: ele.slug, label: ele.name }));
            setPopularOptions(mockDestinations);
          }

          // For Main Packages, use packages
          if (data.packages) {
            mockTours = []
            data.packages.map(ele => mockTours.push({ value: ele.slug, label: ele.title }))
            setMainOptions(mockTours);
          }
        }

        await fetchData();

      } catch (error) {
        console.log('Error fetching tours:', error);
        showError('Failed to load data');
      } finally {
        setLoading('fetchData', false);
      }
    };

    fetchTours();
    fetchThemes();
  }, []);

  const fetchPackages = async (category) => {
    let res = await fetch(`https://data.tripknock.in/themes-pages/get-packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category: category })
    });
    let data = await res.json();
    // console.log(data);

    if (data.status === true) {
      let mockTours = []
      data.data.map(ele => mockTours.push({ value: ele.slug, label: ele.title }))
      setMainOptions(mockTours);
    }
  }

  const validateTheme = async (from, category) => {
    let res = await fetch(`https://data.tripknock.in/themes-pages/validate-theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: from, category: category })
    });

    let data = await res.json();
    if (data.status === false) {
      showError('Theme page already exists');
    }
  }

  async function validateSlug(slug) {
    if (slug === '') return false;
    const response = await fetch('https://data.tripknock.in/themes-pages/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug: slug })
    });
    const data = await response.json();

    if (data.status === false) {
      showError('Slug already exist');
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      fetchPackages(value);
      validateTheme(formData.fromDestination, value);
    }
    if (name === 'fromDestination') {
      validateTheme(value, formData.category);
    }
    // Removed destination validation since destinationName is no longer required in Basic Intro tab
    if (name === 'urlSlug') {
      setFormData(prev => ({
        ...prev, urlSlug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      }));
      validateSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
      return;
    } else if ((name === 'destinationHeading')) {
      setFormData(prev => ({ ...prev, destinationHeading: value }));
      setFormData(prev => ({
        ...prev,
        urlSlug: value
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '')
      }));
      validateSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      destinationImage: [...prev.destinationImage, ...newPreviewImages]
    }));
  };

  const handleFaqChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (status) => {
    showGlobalLoading('Creating theme page...');

    // Removed validation for destinationName since it's no longer in Basic Intro tab

    if (formData.title === '') {
      setActiveTab('basic');
      showError('Please fill Destination Heading');
      hideGlobalLoading();
      return;
    }
    if (formData.description === '') {
      setActiveTab('basic');
      showError('Please fill Description');
      hideGlobalLoading();
      return;
    }
    if (formData.images.length > 3 || formData.images.length === 0) {
      setActiveTab('basic');
      showError('Please check images');
      hideGlobalLoading();
      return;
    }

    try {
      const formDataToSend = new FormData();
      let data = {};
      data.status = status;
      data.meta = JSON.stringify({
        title: formData.metaTitle || "",
        tags: formData.metaTags || "",
        extraTags: formData.extraMetaTags || ""
      });
      data.fromDestination = formData.fromDestination || "";
      data.name = formData.destinationHeading || ""; // Use destinationHeading as name since we removed destinationName field
      data.category = formData.category || "";
      data.title = formData.destinationHeading || "";
      data.slug = formData.urlSlug || "";
      data.description = formData.description || "";
      data.popularDestinations = formData.popularPackages || [];
      data.mainPackages = formData.mainPackages || [];
      data.longDescription = formData.detailedDescription || "";
      data.faqs = JSON.stringify(formData.faqs || []);

      formDataToSend.append('data', JSON.stringify(data));

      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      let res = await fetch("https://data.tripknock.in/themes-pages/create", {
        method: 'POST',
        headers: {
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: formDataToSend,
      })

      res = await res.json();
      if (res.status === true) {
        showSuccess('Theme page created successfully!');
        setTimeout(() => {
          router.push('/themes');
        }, 1500);
      } else {
        showError(res.message || 'Failed to create theme page');
      }
    } catch (error) {
      console.log('Error creating destination:', error);
      showError('An error occurred while creating theme page');
    } finally {
      hideGlobalLoading();
    }
  };

  return (
    <div ref={sectionRef} className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Create Theme Page</h1>
          <p className="text-secondary-600">Add a new theme page</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="btn-secondary flex items-center gap-2"
          >
            <Close className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isLoading('fetchData') || false}
            className="btn-secondary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isLoading('fetchData') || false}
            className="btn-primary flex items-center gap-2"
          >
            <Public className="w-5 h-5" />
            Publish
          </button>
        </div>
      </div>



      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="border-b border-secondary-200">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium focus:outline-none ${activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-secondary-500 hover:text-secondary-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">

          {activeTab === 'introduction' && (
            <div className="space-y-6">
              {/* Theme/Category and From Location - moved outside collapse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Theme/Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="">Select Theme/Category</option>
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.name}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    From Location
                  </label>
                  <input
                    type="text"
                    name="fromDestination"
                    value={formData.fromDestination}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter From Location"
                  />
                </div>
              </div>
              <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                <button
                  onClick={() => { scrollToTop(); setActiveTab('basic') }}
                  disabled={isLoading('fetchData')}
                  className="btn-primary flex items-center gap-2"
                >
                  Next Tab
                  <SkipNextIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Basic Information */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Destination Heading
                  </label>
                  <input
                    type="text"
                    name="destinationHeading"
                    value={formData.destinationHeading}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter destination heading"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    name="urlSlug"
                    value={formData.urlSlug}
                    className="input-field w-full"
                    onChange={handleChange}
                  />
                </div>


                <div className="col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Destination Image
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center justify-center w-64 h-40 px-4 transition bg-white border-2 border-secondary-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-secondary-400 focus:outline-none">
                      <div className="flex flex-col items-center space-y-2">
                        <CloudUpload className="w-8 h-8 text-secondary-400" />
                        <span className="text-sm text-secondary-500">Click to upload image</span>
                      </div>
                      <input
                        type="file"
                        name="destinationImage"
                        accept="image/*"
                        className="hidden"
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                    {formData.destinationImage && formData.destinationImage.length > 0 &&
                      formData.destinationImage.map((preview, index) => (
                        <div className="relative w-64 h-40" key={index}>
                          <img
                            src={preview}
                            alt="Destination preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index),
                                destinationImage: prev.destinationImage.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-secondary-100"
                          >
                            <Close className="w-4 h-4 text-secondary-600" />
                          </button>
                        </div>
                      )
                      )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Description
                </label>
                <HtmlEditor
                  value={formData.description}
                  onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                />
              </div>

              {/* Meta Tags Section */}
              <div className="mt-6 border border-secondary-200 rounded-lg">
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
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        name="metaTitle"
                        className="input-field w-full"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        placeholder="Enter meta title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Meta Description
                      </label>
                      <input
                        type="text"
                        name="metaTags"
                        className="input-field w-full"
                        value={formData.metaTags}
                        onChange={handleChange}
                        placeholder="Enter meta description for SEO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Additional Meta Tags
                      </label>
                      <textarea
                        name="extraMetaTags"
                        className="input-field w-full h-24 resize-none"
                        value={formData.extraMetaTags}
                        onChange={handleChange}
                        placeholder="Enter additional meta tags"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                <button
                  onClick={() => { scrollToTop(); setActiveTab('introduction') }}
                  disabled={isLoading('fetchData')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => { scrollToTop(); setActiveTab('packages') }}
                  disabled={isLoading('fetchData')}
                  className="btn-primary flex items-center gap-2"
                >
                  Next Tab
                  <SkipNextIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Popular Destination
                </label>
                <Select
                  isMulti
                  name="popularPackages"
                  options={popularOptions}
                  value={popularOptions.filter(option => formData.popularPackages.includes(option.value))}
                  onChange={(selected) => {
                    setFormData(prev => ({
                      ...prev,
                      popularPackages: selected ? selected.map(option => option.value) : []
                    }));
                  }}
                  className="w-full"
                  classNamePrefix="select"
                  placeholder="Search and select popular destinations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Main Packages
                </label>
                <Select
                  isMulti
                  name="mainPackages"
                  options={mainOptions}
                  value={mainOptions.filter(option => formData.mainPackages.includes(option.value))}
                  onChange={(selected) => {
                    setFormData(prev => ({
                      ...prev,
                      mainPackages: selected ? selected.map(option => option.value) : []
                    }));
                  }}
                  className="w-full"
                  classNamePrefix="select"
                  placeholder="Search and select tours..."
                />
              </div>
              <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                <button
                  onClick={() => { scrollToTop(); setActiveTab('basic') }}
                  disabled={isLoading('fetchData')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => { scrollToTop(); setActiveTab('description') }}
                  disabled={isLoading('fetchData')}
                  className="btn-primary flex items-center gap-2"
                >
                  Next Tab
                  <SkipNextIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Destination in Detail
                </label>
                <HtmlEditor
                  value={formData.detailedDescription}
                  onChange={(content) => setFormData(prev => ({ ...prev, detailedDescription: content }))}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-secondary-700">
                    FAQs
                  </label>
                </div>

                <div className="space-y-4">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-sm font-medium">FAQ #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Close className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                            className="input-field w-full"
                            placeholder="Enter question"
                          />
                        </div>
                        <div>
                          <HtmlEditor
                            value={faq.answer}
                            onChange={(content) => handleFaqChange(index, 'answer', content)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}


                  <button
                    type="button"
                    onClick={addFaq}
                    className="btn-secondary text-sm"
                  >
                    Add FAQ
                  </button>
                </div>
              </div>
              <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                <button
                  onClick={() => { scrollToTop(); setActiveTab('packages') }}
                  disabled={isLoading('fetchData')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => { scrollToTop(); setActiveTab('review') }}
                  disabled={isLoading('fetchData')}
                  className="btn-primary flex items-center gap-2"
                >
                  Next Tab
                  <SkipNextIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">From Location</dt>
                      <dd className="text-sm text-secondary-900">{formData.fromDestination}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Theme/Category</dt>
                      <dd className="text-sm text-secondary-900">{formData.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Destination Heading</dt>
                      <dd className="text-sm text-secondary-900">{formData.destinationHeading}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">URL Slug</dt>
                      <dd className="text-sm text-secondary-900">{formData.urlSlug}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Description</h3>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formData.description }} />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Seo Tags</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Meta Title</dt>
                      <dd className="text-sm text-secondary-900">{formData.metaTitle || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Meta Description</dt>
                      <dd className="text-sm text-secondary-900">{formData.metaTags || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Additional Meta Tags</dt>
                      <dd className="text-sm text-secondary-900">{formData.extraMetaTags || '-'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Popular Destination</h3>
                  <dl className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.popularPackages.map((pkg, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded">
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </dl>
                  <h3 className="text-lg font-medium mt-5 mb-4">Main Packages</h3>
                  <dl className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.mainPackages.map((pkg, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded">
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Destination in Detail</h3>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formData.detailedDescription }} />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">FAQs</h3>
                <div className="space-y-4">
                  {formData.faqs.map((faq, index) => (
                    <div key={index} className="border-b border-secondary-200 pb-4">
                      <h4 className="text-sm font-medium mb-2">{faq.question}</h4>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => { scrollToTop(); setActiveTab('description') }}
                  disabled={isLoading('fetchData')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={isLoading('fetchData')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={isLoading('fetchData')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Public className="w-5 h-5" />
                  Publish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
