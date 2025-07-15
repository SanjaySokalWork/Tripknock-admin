'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  CloudUpload,
  Close,
  Add,
  Delete,
  ArrowBack,
  ExpandMore
} from '@mui/icons-material';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';

const HtmlEditor = dynamic(() => import('@/components/HtmlEditor'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
});
import Cookies from 'js-cookie';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

const tabs = [
  { id: 'meta', label: 'Meta SEO' },
  { id: 'banners', label: 'Banners' },
  { id: 'popular', label: 'Popular Content' },
  { id: 'themes', label: 'Themes' },
  { id: 'seasons', label: 'Seasons' },
  { id: 'domestic', label: 'Domestic' },
  { id: 'international', label: 'International' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About Us' },
  { id: 'blogs', label: 'Blogs' }
];

export default function HomepageManager() {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();
  const sectionRef = useRef(null);

  const [activeTab, setActiveTab] = useState('meta');
  const [saving, setSaving] = useState(false);

  // Load options
  const [loadOptions, setLoadOptions] = useState({
    destinations: [],
    packages: [],
    themes: [],
    seasons: [],
    blogs: [],
    reviews: []
  });

  // Form data
  const [formData, setFormData] = useState({
    meta: {
      title: '',
      description: '',
      extraTags: ''
    },
    banners: [
      {
        image: null,
        previewImage: null,
        heading: '',
        paragraph: ''
      }
    ],
    popularDestinations: [],
    popularPackages: [],
    themes: [],
    seasons: [],
    domestic: {
      destinations: [],
      packages: []
    },
    international: {
      destinations: [],
      packages: []
    },
    reviews: [],
    aboutUs: {
      stats: [
        { number: '', label: '' }
      ],
      content: ''
    },
    blogs: []
  });

  useEffect(() => {
    document.title = "Homepage Manager - Tripknock";
    loadData();
    loadHomepageData();
  }, []);

  const loadData = async () => {
    try {
      setLoading('loadData', true, 'Loading data...');
      const response = await fetch('https://data.tripknock.in/homepage/load');
      if (response.ok) {
        const data = await response.json();
        setLoadOptions(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data');
    } finally {
      setLoading('loadData', false);
    }
  };

  const loadHomepageData = async () => {
    try {
      setLoading('loadHomepage', true, 'Loading homepage data...');
      const response = await fetch('https://data.tripknock.in/homepage/get');
      if (response.ok) {
        const data = await response.json();
        let banners = data.banners;
        banners.forEach(banner => {
          banner.previewImage = null;
          if (banner.image && banner.image.startsWith('https://data.tripknock.in/uploads/')) {
            banner.image = banner.image.replace('https://data.tripknock.in/uploads/', '');
          } else if (banner.image && banner.image.startsWith('/uploads/')) {
            banner.image = banner.image.replace('/uploads/', '');
          }
        });
        data.banners = banners;

        console.log(data);

        setFormData(prevData => ({
          ...prevData,
          ...data,
          popularDestinations: mapSelectedDestinations(data.popularDestinations, loadOptions.destinations),
          popularPackages: mapSelectedPackages(data.popularPackages, loadOptions.packages),
          domestic: {
            ...prevData.domestic,
            ...data.domestic,
            destinations: mapSelectedDestinations(data.domestic?.destinations, loadOptions.destinations),
            packages: mapSelectedPackages(data.domestic?.packages, loadOptions.packages)
          },
          international: {
            ...prevData.international,
            ...data.international,
            destinations: mapSelectedDestinations(data.international?.destinations, loadOptions.destinations),
            packages: mapSelectedPackages(data.international?.packages, loadOptions.packages)
          }
        }));
      }
    } catch (error) {
      console.error('Error loading homepage data:', error);
      showError('Failed to load homepage data');
    } finally {
      setLoading('loadHomepage', false);
    }
  };

  const scrollToTop = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Banner handlers
  const addBanner = () => {
    setFormData(prev => ({
      ...prev,
      banners: [...prev.banners, { image: null, previewImage: null, heading: '', paragraph: '' }]
    }));
  };

  const removeBanner = (index) => {
    setFormData(prev => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== index)
    }));
  };

  const updateBanner = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      banners: prev.banners.map((banner, i) =>
        i === index ? { ...banner, [field]: value } : banner
      )
    }));
  };

  // Banner Image Upload Component
  const BannerUpload = ({ index }) => {
    const { getRootProps, getInputProps } = useDropzone({
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
      },
      multiple: false,
      onDrop: acceptedFiles => {
        if (acceptedFiles.length > 0) {
          const file = acceptedFiles[0];
          updateBanner(index, 'image', file);
          updateBanner(index, 'previewImage', URL.createObjectURL(file));
        }
      }
    });

    const currentBanner = formData.banners[index];
    const imageUrl = currentBanner.previewImage || (typeof currentBanner.image === 'string' && currentBanner.image ? `https://data.tripknock.in/uploads/${currentBanner.image}` : currentBanner.image);

    return (
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input {...getInputProps()} />
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt={`Banner ${index + 1}`}
              className="h-40 w-full object-cover rounded mx-auto"
            />
            <p className="mt-2 text-sm text-gray-600">Click or drag to replace image</p>
          </div>
        ) : (
          <div className="py-8">
            <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-600 mt-2">Click or drag image here to upload</p>
            <p className="text-sm text-gray-500 mt-1">Supports: JPG, PNG, GIF, WebP</p>
          </div>
        )}
      </div>
    );
  };

  // Theme handlers
  const addTheme = () => {
    setFormData(prev => ({
      ...prev,
      themes: [...prev.themes, { theme: null, packages: [] }]
    }));
  };

  const removeTheme = (index) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.filter((_, i) => i !== index)
    }));
  };

  const updateTheme = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.map((theme, i) =>
        i === index ? { ...theme, [field]: value } : theme
      )
    }));
  };

  // Stats handlers
  const addStat = () => {
    setFormData(prev => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        stats: [...prev.aboutUs.stats, { number: '', label: '' }]
      }
    }));
  };

  const removeStat = (index) => {
    setFormData(prev => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        stats: prev.aboutUs.stats.filter((_, i) => i !== index)
      }
    }));
  };

  const updateStat = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        stats: prev.aboutUs.stats.map((stat, i) =>
          i === index ? { ...stat, [field]: value } : stat
        )
      }
    }));
  };

  // --- Backend-compatible mapping helpers ---
  const mapDestinations = (destArr) =>
    (destArr || []).map(dest => ({
      value: dest.value,
      label: dest.type, // backend uses 'type' for name
      ...dest
    }));
  const mapSelectedDestinations = (selected, all) => {
    if (!selected) return [];
    return selected.map(sel => {
      if (typeof sel === 'object' && sel.value && sel.label) return sel;
      const found = (all || []).find(d => d.value === sel);
      return found ? { value: found.value, label: found.type, ...found } : { value: sel, label: sel };
    });
  };
  const mapPackages = (pkgArr) =>
    (pkgArr || []).map(pkg => ({
      value: pkg.value,
      label: pkg.label,
      ...pkg
    }));
  const mapSelectedPackages = (selected, all) => {
    if (!selected) return [];
    return selected.map(sel => {
      if (typeof sel === 'object' && sel.value && sel.label) return sel;
      const found = (all || []).find(p => p.value === sel);
      return found ? { value: found.value, label: found.label, ...found } : { value: sel, label: sel };
    });
  };

  // Helper: Get packages for a theme
  const getPackagesForTheme = (themeSlug) => {
    if (!themeSlug) return [];
    return mapPackages(loadOptions.packages).filter(pkg => {
      // pkg.themes can be array of slugs or objects
      if (!pkg.themes) return false;
      if (Array.isArray(pkg.themes)) {
        return pkg.themes.includes(themeSlug) || pkg.themes.some(t => t.value === themeSlug || t.slug === themeSlug);
      }
      return false;
    });
  };

  // Save handler
  const handleSave = async () => {
    try {
      setSaving(true);
      setLoading('saving', true, 'Saving homepage data...');

      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(formData));

      // Add banner images
      formData.banners.forEach((banner, index) => {
        if (banner.image && typeof banner.image !== 'string') {
          formDataToSend.append(`bannerImages`, banner.image);
        }
      });

      const response = await fetch('https://data.tripknock.in/homepage/save', {
        method: 'POST',
        headers: {
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (result.status) {
        showSuccess(result.message);
        loadHomepageData(); // Reload data
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error('Error saving:', error);
      showError('Failed to save homepage data');
    } finally {
      setSaving(false);
      setLoading('saving', false);
    }
  };

  const renderMetaTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
        </label>
        <input
          type="text"
          value={formData.meta.title}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            meta: { ...prev.meta, title: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter meta title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <textarea
          value={formData.meta.description}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            meta: { ...prev.meta, description: e.target.value }
          }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter meta description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Extra Meta Tags
        </label>
        <textarea
          value={formData.meta.extraTags}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            meta: { ...prev.meta, extraTags: e.target.value }
          }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter additional meta tags (HTML format)"
        />
      </div>
    </div>
  );

  const renderBannersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Homepage Banners</h3>
        {/* <button
          onClick={addBanner}
          className="btn-primary flex items-center gap-2"
        >
          <Add className="h-4 w-4" />
          Add Banner
        </button> */}
      </div>

      {formData.banners.map((banner, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium">
              Banner
            </h4>
            {formData.banners.length > 1 && (
              <button
                onClick={() => removeBanner(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Delete className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image
              </label>
              <BannerUpload index={index} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={banner.heading}
                  onChange={(e) => updateBanner(index, 'heading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter banner heading"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paragraph
                </label>
                <textarea
                  value={banner.paragraph}
                  onChange={(e) => updateBanner(index, 'paragraph', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter banner paragraph"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPopularTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Destinations
        </label>
        <Select
          isMulti
          value={formData.popularDestinations}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            popularDestinations: selected || []
          }))}
          options={mapDestinations(loadOptions.destinations)}
          placeholder="Select popular destinations..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Packages
        </label>
        <Select
          isMulti
          value={formData.popularPackages}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            popularPackages: selected || []
          }))}
          options={mapPackages(loadOptions.packages)}
          placeholder="Select popular packages..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );

  const renderThemesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Theme-wise Packages</h3>
        <button
          onClick={addTheme}
          className="btn-primary flex items-center gap-2"
        >
          <Add className="h-4 w-4" />
          Add Theme
        </button>
      </div>

      {formData.themes.map((themeItem, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium">Theme {index + 1}</h4>
            <button
              onClick={() => removeTheme(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Theme
              </label>
              <Select
                value={themeItem.theme}
                onChange={(selected) => updateTheme(index, 'theme', selected)}
                options={mapPackages(loadOptions.themes)}
                placeholder="Select a theme..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Packages for this Theme
              </label>
              <Select
                isMulti
                value={themeItem.packages}
                onChange={(selected) => updateTheme(index, 'packages', selected || [])}
                options={themeItem.theme ? getPackagesForTheme(themeItem.theme.value || themeItem.theme.slug) : []}
                placeholder="Select packages for this theme..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSeasonsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Seasons
        </label>
        <Select
          isMulti
          value={formData.seasons}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            seasons: selected || []
          }))}
          options={loadOptions.seasons}
          placeholder="Select popular seasons..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );

  const renderDomesticTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Domestic Destinations (Maximum 7)
        </label>
        <Select
          isMulti
          value={formData.domestic.destinations}
          onChange={(selected) => {
            if (!selected || selected.length <= 7) {
              setFormData(prev => ({
                ...prev,
                domestic: { ...prev.domestic, destinations: selected || [] }
              }));
            }
          }}
          options={mapDestinations(loadOptions.destinations)}
          placeholder="Select domestic destinations (max 7)..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.domestic.destinations.length}/7 destinations selected
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Domestic Packages
        </label>
        <Select
          isMulti
          value={formData.domestic.packages}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            domestic: { ...prev.domestic, packages: selected || [] }
          }))}
          options={mapPackages(loadOptions.packages)}
          placeholder="Select domestic packages..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );

  const renderInternationalTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular International Destinations (Maximum 7)
        </label>
        <Select
          isMulti
          value={formData.international.destinations}
          onChange={(selected) => {
            if (!selected || selected.length <= 7) {
              setFormData(prev => ({
                ...prev,
                international: { ...prev.international, destinations: selected || [] }
              }));
            }
          }}
          options={mapDestinations(loadOptions.destinations)}
          placeholder="Select international destinations (max 7)..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.international.destinations.length}/7 destinations selected
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular International Packages
        </label>
        <Select
          isMulti
          value={formData.international.packages}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            international: { ...prev.international, packages: selected || [] }
          }))}
          options={mapPackages(loadOptions.packages)}
          placeholder="Select international packages..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Text Reviews
        </label>
        <Select
          isMulti
          value={formData.reviews}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            reviews: selected || []
          }))}
          options={loadOptions.reviews}
          placeholder="Select customer reviews..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Statistics</h3>
          <button
            onClick={addStat}
            className="btn-primary flex items-center gap-2"
          >
            <Add className="h-4 w-4" />
            Add Statistic
          </button>
        </div>

        {formData.aboutUs.stats.map((stat, index) => (
          <div key={index} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number
              </label>
              <input
                type="text"
                value={stat.number}
                onChange={(e) => updateStat(index, 'number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1000+"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(index, 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Happy Customers"
              />
            </div>
            {formData.aboutUs.stats.length > 1 && (
              <button
                onClick={() => removeStat(index)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <Delete className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          About Us Content
        </label>
        <HtmlEditor
          value={formData.aboutUs.content}
          onChange={(content) => setFormData(prev => ({
            ...prev,
            aboutUs: { ...prev.aboutUs, content }
          }))}
          placeholder="Enter about us content..."
          height={300}
        />
      </div>
    </div>
  );

  const renderBlogsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Featured Blogs
        </label>
        <Select
          isMulti
          value={formData.blogs}
          onChange={(selected) => setFormData(prev => ({
            ...prev,
            blogs: selected || []
          }))}
          options={loadOptions.blogs}
          placeholder="Select blogs to feature on homepage..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'meta': return renderMetaTab();
      case 'banners': return renderBannersTab();
      case 'popular': return renderPopularTab();
      case 'themes': return renderThemesTab();
      case 'seasons': return renderSeasonsTab();
      case 'domestic': return renderDomesticTab();
      case 'international': return renderInternationalTab();
      case 'reviews': return renderReviewsTab();
      case 'about': return renderAboutTab();
      case 'blogs': return renderBlogsTab();
      default: return null;
    }
  };

  if (isLoading('loadData') || isLoading('loadHomepage')) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" ref={sectionRef}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowBack className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Manager</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || isLoading('saving')}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
