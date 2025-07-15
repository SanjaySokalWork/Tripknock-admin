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
  { id: 'packages', label: 'Popular Packages' },
  { id: 'description', label: 'Destination Description' },
  { id: 'review', label: 'Review' },
];

export default function EditDestination({ params }) {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('introduction');
  const [saving, setSaving] = useState(false);
  const [popularOptions, setPopularOptions] = useState([]);
  const [mainOptions, setMainOptions] = useState([]);
  const [showMetaSection, setShowMetaSection] = useState(false);
  const [showtheLoc, setShowshowtheLoc] = useState(false);
  const [themes, setThemes] = useState([]);
  const { id } = React.use(params);
  const [COUNTRIES, setCountries] = useState([
    'India',
    'Nepal',
    'Bhutan',
    'Sri Lanka',
    'Maldives',
    'Thailand',
    'Singapore',
    'Malaysia',
    'Indonesia',
    'Vietnam'
  ]);

  const [formData, setFormData] = useState({
    metaTitle: '',
    metaTags: '',
    extraMetaTags: '',
    category: '',
    fromDestination: '',
    destinationName: '',
    country: 'India',
    destinationHeading: '',
    images: [],
    newImages: [],
    urlSlug: '',
    description: '',
    destinationImage: [],
    popularPackages: [],
    mainPackages: [],
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
    document.title = 'Edit Destination - Tripknock';
    setSaving(true);
    let mockTours = [
      { value: 'Kashmir Valley Tour', label: 'Kashmir Valley Tour' },
      { value: 'Gulmarg Skiing Adventure', label: 'Gulmarg Skiing Adventure' },
      { value: 'Ladakh Explorer', label: 'Ladakh Explorer' },
      { value: 'Kerala Backwaters', label: 'Kerala Backwaters' },
      { value: 'Rajasthan Heritage Tour', label: 'Rajasthan Heritage Tour' }
    ];
    let cuntries = []
    async function fetchData() {
      let res = await fetch("https://data.tripknock.in/destination/load");
      let data = await res.json();
      if (data.pachages) {
        mockTours = []
        data.pachages.map(ele => mockTours.push({ value: ele.slug, label: ele.title }))
        setMainOptions(mockTours);
        setPopularOptions(mockTours);
      }

      if (data.country) {
        data.country.map(ele => cuntries.push(ele.name))
        setCountries(cuntries);
      }
    }

    fetchData();
    fetchThemes();

    const fetchTours = async () => {
      try {
        let res = await fetch("https://data.tripknock.in/destination/get/" + id);
        res = await res.json();
        let data = {
          metaTitle: res.meta.title,
          metaTags: res.meta.tags,
          extraMetaTags: res.meta.extraTags,
          category: res.category,
          fromDestination: res.from,
          destinationName: res.name,
          country: res.country,
          destinationHeading: res.title,
          images: res.images,
          slug: res.slug,
          urlSlug: res.slug,
          description: res.description,
          popularPackages: Array.isArray(res.popularPackages)
            ? res.popularPackages.map(pkg => typeof pkg === 'string' ? pkg : pkg.slug || pkg.value || pkg)
            : [],
          mainPackages: Array.isArray(res.mainPackages)
            ? res.mainPackages.map(pkg => typeof pkg === 'string' ? pkg : pkg.slug || pkg.value || pkg)
            : [],
          detailedDescription: res.longDescription,
          faqs: res.faqs
        }

        fetchPopularPackages(data.destinationName, data.category)

        setFormData(prev => ({ ...prev, ...data }));

        // Create preview images for display
        let destinationImage = await Promise.all(
          res.images.map(async (img) => {
            let response = await fetch(`https://data.tripknock.in/uploads/${img}`);
            let blob = await response.blob();
            return URL.createObjectURL(blob);
          })
        );

        setFormData(prev => ({ ...prev, destinationImage }));
      } catch (error) {
        console.log('Error fetching tours:', error);
      }
    };

    fetchTours();
    setSaving(false);
  }, []);

  async function validateSlug(slug) {
    if (slug === '') return false;
    const response = await fetch('https://data.tripknock.in/destination/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug: slug })
    });
    const data = await response.json();
    if (data.status !== true) {
      showWarning('Slug already exist', false);
    }
  }

  async function validateType(type) {
    if (type === '') return false;
    const response = await fetch('https://data.tripknock.in/destination/validate-destination', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(type)
    });
    const data = await response.json();
    if (data.status !== true) {
      showWarning('Destination already exist', false);
    }
  }

  async function fetchPopularPackages(dname, cname) {
    let res = await fetch("https://data.tripknock.in/destination/popular-packages", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dname: dname, cname: cname })
    })

    let data = await res.json();
    if (data.status === true) {
      let mockTours = []
      data.data.map(ele => mockTours.push({ value: ele.slug, label: ele.title }))
      setMainOptions(mockTours || []);
      setPopularOptions(mockTours || []);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      fetchPopularPackages(formData.destinationName, value);
      validateType({
        name: formData.destinationName,
        from: formData.fromDestination,
        category: value
      });
    }

    if (name === 'destinationName') {
      fetchPopularPackages(value, formData.category);
      validateType({
        name: value,
        from: formData.fromDestination,
        category: formData.category
      });
    }
    if (name === 'fromDestination') {
      validateType({
        name: formData.destinationName,
        from: value,
        category: formData.category
      });
    }
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
      newImages: [...prev.newImages, ...files],
      destinationImage: [...prev.destinationImage, ...newPreviewImages]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      // Check if this is an existing image or new image
      const totalExistingImages = prev.images.length;

      if (index < totalExistingImages) {
        // Removing an existing image
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
          destinationImage: prev.destinationImage.filter((_, i) => i !== index)
        };
      } else {
        // Removing a new image
        const newImageIndex = index - totalExistingImages;
        return {
          ...prev,
          newImages: prev.newImages.filter((_, i) => i !== newImageIndex),
          destinationImage: prev.destinationImage.filter((_, i) => i !== index)
        };
      }
    });
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
    setSaving(true);

    if (formData.destinationName === "") {
      setActiveTab("introduction")
      showWarning('Please fill Destination Name', false);
      setSaving(false);
      return;
    }

    if (formData.destinationHeading === '') {
      setActiveTab('basic');
      showWarning('Please fill Destination Heading', false);
      setSaving(false);
      return;
    }
    if (formData.description === '') {
      setActiveTab('basic');
      showWarning('Please fill Description', false);
      setSaving(false);
      return;
    }

    const totalImages = (formData.images?.length || 0) + (formData.newImages?.length || 0);

    if (status === 'published' && totalImages === 0) {
      setActiveTab('basic');
      showWarning('At least one image is required for published destinations', false);
      setSaving(false);
      return;
    }

    if (totalImages > 3) {
      setActiveTab('basic');
      showWarning('Maximum 3 images allowed', false);
      setSaving(false);
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
      data.name = formData.destinationName || "";
      data.category = formData.category || "";
      data.country = formData.country || "";
      data.title = formData.destinationHeading || "";
      data.slug = formData.urlSlug || "";
      data.description = formData.description || "";
      data.popularPackages = formData.popularPackages || [];
      data.mainPackages = formData.mainPackages || [];
      data.longDescription = formData.detailedDescription || "";
      data.faqs = JSON.stringify(formData.faqs || []);

      // Send existing images as a separate field in the body data
      data.existingImages = formData.images || [];

      formDataToSend.append('data', JSON.stringify(data));

      // Send new images as files
      if (formData.newImages && formData.newImages.length > 0) {
        for (let i = 0; i < formData.newImages.length; i++) {
          formDataToSend.append('images', formData.newImages[i]);
        }
      }

      let res = await fetch(`https://data.tripknock.in/destination/update/${formData.slug}`, {
        method: 'POST',
        headers: {
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: formDataToSend,
      })

      res = await res.json();
      if (res.status === true) {
        // Check if there were validation errors that caused draft save
        if (res.validationErrors && res.validationErrors.length > 0) {
          showWarning(`Destination saved: ${res.validationErrors.join('. ')}`, false);
          // Don't redirect immediately if saved as draft due to validation
          setTimeout(() => {
            router.push('/destinations');
          }, 3000);
        } else {
          showSuccess(`Destination ${status === 'published' ? 'updated' : 'saved'} successfully!`);
          router.push('/destinations');
        }
      } else {
        showError(res.message || 'Failed to update destination');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('An error occurred while updating the destination');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={sectionRef} className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Edit Destination</h1>
          <p className="text-secondary-600">Edit destination</p>
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
            disabled={saving}
            className="btn-secondary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={saving}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Destination Name
                  </label>
                  <input
                    type="text"
                    name="destinationName"
                    value={formData.destinationName}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter destination name"
                  />
                </div>
              </div>
              {/* Meta Tags Section */}
              <div className="mt-6 border border-secondary-200 rounded-lg">
                <button
                  type="button"
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none"
                  onClick={() => setShowshowtheLoc(!showtheLoc)}
                >
                  <span>Add Theme/Category OR From Location (Optional)</span>
                  <svg
                    className={`h-5 w-5 text-secondary-500 transform ${showtheLoc ? 'rotate-180' : ''} transition-transform duration-200`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showtheLoc && (
                  <div className="px-4 py-3 border-t border-secondary-200 space-y-4">
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
                  </div>
                )}
              </div>
              <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                <button
                  onClick={() => { scrollToTop(); setActiveTab('basic') }}
                  disabled={saving}
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
                            onClick={() => handleRemoveImage(index)}
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
                  disabled={saving}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => { scrollToTop(); setActiveTab('packages') }}
                  disabled={saving}
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
                  Popular Packages <span className="text-red-500">*</span>
                  <span className="text-xs text-secondary-500 ml-2">
                    (Minimum 4 required for published destinations)
                  </span>
                </label>
                <Select
                  isMulti
                  name="popularPackages"
                  options={popularOptions}
                  value={popularOptions.length > 0 && formData.popularPackages
                    ? popularOptions.filter(option => formData.popularPackages.includes(option.value))
                    : []
                  }
                  onChange={(selected) => {
                    setFormData(prev => ({
                      ...prev,
                      popularPackages: selected ? selected.map(option => option.value) : []
                    }));
                  }}
                  className="w-full"
                  classNamePrefix="select"
                  placeholder="Search and select tours..."
                  isLoading={popularOptions.length === 0}
                />
                <div className="mt-1 text-xs text-secondary-600">
                  Selected: {formData.popularPackages?.length || 0}/4 minimum
                  {(!formData.popularPackages || formData.popularPackages.length < 4) && (
                    <span className="text-red-500 ml-2">
                      • {4 - (formData.popularPackages?.length || 0)} more needed for published status
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Main Packages <span className="text-red-500">*</span>
                  <span className="text-xs text-secondary-500 ml-2">
                    (Minimum 1 required for published destinations)
                  </span>
                </label>
                <Select
                  isMulti
                  name="mainPackages"
                  options={mainOptions}
                  value={mainOptions.length > 0 && formData.mainPackages
                    ? mainOptions.filter(option => formData.mainPackages.includes(option.value))
                    : []
                  }
                  onChange={(selected) => {
                    setFormData(prev => ({
                      ...prev,
                      mainPackages: selected ? selected.map(option => option.value) : []
                    }));
                  }}
                  className="w-full"
                  classNamePrefix="select"
                  placeholder="Search and select tours..."
                  isLoading={mainOptions.length === 0}
                />
                <div className="mt-1 text-xs text-secondary-600">
                  Selected: {formData.mainPackages?.length || 0}/1 minimum
                  {(!formData.mainPackages || formData.mainPackages.length < 1) && (
                    <span className="text-red-500 ml-2">
                      • At least 1 main package needed for published status
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                <button
                  onClick={() => { scrollToTop(); setActiveTab('basic') }}
                  disabled={saving}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => { scrollToTop(); setActiveTab('description') }}
                  disabled={saving}
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
                  disabled={saving}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => { scrollToTop(); setActiveTab('review') }}
                  disabled={saving}
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
                      <dt className="text-sm font-medium text-secondary-500">Destination Name</dt>
                      <dd className="text-sm text-secondary-900">{formData.destinationName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Country</dt>
                      <dd className="text-sm text-secondary-900">{formData.country}</dd>
                    </div>
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
                  <h3 className="text-lg font-medium mb-4">Popular Packages</h3>
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
                  disabled={saving}
                  className="btn-secondary flex items-center gap-2"
                >
                  <SkipPreviousIcon className="w-5 h-5" />
                  Previous Tab
                </button>
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={saving}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={saving}
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
