'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CloudUpload, Close, Add, Delete, Search, Public } from '@mui/icons-material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import HtmlEditor from '@/components/HtmlEditor';
import Loading from '../loading';
import Cookies from 'js-cookie';
import { useNotification } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';

const tabs = [
  { id: 'basic', label: 'Basic Information' },
  { id: 'details', label: 'Tour Details' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'review', label: 'Review & Publish' }
];

const TOUR_TYPES = ['deluxe', 'premium', 'luxury'];

export default function CreateTour() {
  const { showSuccess, showError, showInfo } = useNotification();
  const { setLoading, isLoading } = useLoading();

  const [THEMES, setThemes] = useState([
    { value: 'honeymoon', label: 'Honeymoon' },
    { value: 'family', label: 'Family' },
    { value: 'youngAdults', label: 'Young Adults' },
    { value: 'religious', label: 'Religious' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'adventure', label: 'Adventure' }
  ]);

  const [DESTINATIONS, setDestinations] = useState([
    'Goa', 'Kashmir', 'Ladakh', 'Kerala', 'Rajasthan', 'Himachal Pradesh',
    'Uttarakhand', 'Andaman', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Maharashtra'
  ]);

  const [TOUR_INCLUDES, setIncludes] = useState([
    { value: 'sightseeing', label: 'Sightseeing' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'flight', label: 'Flight' },
    { value: 'meals', label: 'Meals' },
    { value: 'transport', label: 'Transport' },
    { value: 'guide', label: 'Tour Guide' },
    { value: 'activities', label: 'Activities' },
    { value: 'transfers', label: 'Airport Transfers' }
  ]);

  const [SEASONS, setSeasons] = useState([
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'winter', label: 'Winter' }
  ]);

  const sectionRef = useRef(null);

  const scrollToTop = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [seasonSearch, setSeasonSearch] = useState('');
  const [themeSearch, setThemeSearch] = useState('');
  const [includesSearch, setIncludesSearch] = useState('');
  const [showDestinations, setShowDestinations] = useState(false);
  const [showSeasons, setShowSeasons] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showIncludes, setShowIncludes] = useState(false);
  const [showMetaSection, setShowMetaSection] = useState(false);
  const destinationRef = useRef(null);
  const seasonRef = useRef(null);
  const themeRef = useRef(null);
  const includesRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState({ type: '', message: '' });

  useEffect(() => {
    function handleClickOutside(event) {
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinations(false);
      }
      if (seasonRef.current && !seasonRef.current.contains(event.target)) {
        setShowSeasons(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setShowThemes(false);
      }
      if (includesRef.current && !includesRef.current.contains(event.target)) {
        setShowIncludes(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    metaTitle: '',
    metaTags: '',
    extraMetaTags: '',
    days: '',
    nights: '',
    rating: '4.5',
    customization: 'yes',
    destinations: [],
    maxGroupSize: '2',
    images: [],
    previewImages: [],
    seasons: [],
    themes: [],
    includes: [],
    journey: [''],
    marking: '',
    slug: '',

    overview: '',
    itinerary: [
      {
        day: 1,
        title: '',
        description: '',
        includes: []
      }
    ],
    inclusions: [''],
    exclusions: [''],
    additionalInfo: '',
    pricing: {
      deluxe: {
        regularPrice: '',
        discountedPrice: '',
        pricingInfo: '',
        emiStartsFrom: '',
        additionalEmiInfo: ''
      },
      premium: {
        regularPrice: '',
        discountedPrice: '',
        pricingInfo: '',
        emiStartsFrom: '',
        additionalEmiInfo: ''
      },
      luxury: {
        regularPrice: '',
        discountedPrice: '',
        pricingInfo: '',
        emiStartsFrom: '',
        additionalEmiInfo: ''
      }
    },
    faqs: [
      {
        question: '',
        answer: ''
      }
    ]
  });

  useEffect(() => {
    document.title = "Create package - Tripknock";
    setLoading('loadData', true, 'Loading tour data...');

    const fetchData = async () => {
      try {
        const response = await fetch("https://data.tripknock.in/package/load");
        const result = await response.json();

        if (result.season) {
          let newSeason = []
          result.season.map(ele => newSeason.push({ value: ele.slug, label: ele.name }))
          setSeasons(newSeason);
        }

        if (result.theme) {
          let newtheme = []
          result.theme.map(ele => newtheme.push({ value: ele.slug, label: ele.name }))
          setThemes(newtheme);
        }

        if (result.include) {
          let newInclude = []
          result.include.map(ele => newInclude.push({ value: ele.name, label: ele.name }))
          setIncludes(newInclude);
        }

        if (result.destination) {
          let newDestination = [];
          result.destination.map(ele => {
            let id = ele.id;
            try {
              // Try to parse type field first (for destinations with JSON type)
              const typeData = JSON.parse(ele.type);
              newDestination.push({ value: id, label: typeData.name });
            } catch (error) {
              // Fallback to name field if type parsing fails
              newDestination.push({ value: id, label: ele.name });
            }
          });

          const uniqueByLabel = new Map();

          newDestination.forEach(item => {
            if (!uniqueByLabel.has(item.label)) {
              uniqueByLabel.set(item.label, item);
            }
          });

          setDestinations(Array.from(uniqueByLabel.values()));
        }
      } catch (error) {
        console.log('Error loading tour data:', error);
        showError('Failed to load tour data');
      } finally {
        setLoading('loadData', false);
      }
    };

    fetchData();
  }, [])

  const validateSlug = (slug) => {
    if (slug === '') return false;
    fetch("https://data.tripknock.in/package/check", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'admin': JSON.parse(Cookies.get('tk_auth_details')).email
      },
      body: JSON.stringify({ slug: slug })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === true) {
          // setError({ type: 'error', message: data.message });
          showError(data.message);
        } else {
          // setError({ type: 'no', message: data.message });
          console.log(data.message);
        }
      })
      .catch(err => {
        showError(err);
        console.log(err);
      })
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      setFormData(prev => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '')
      }));
      validateSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
      return;
    } else if ((name === 'title')) {
      setFormData(prev => ({ ...prev, title: value }));
      setFormData(prev => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '')
      }));
      validateSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePricingChange = (tourType, field, value) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [tourType]: {
          ...prev.pricing[tourType],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewImages = files.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      previewImages: [...prev.previewImages, ...newPreviewImages]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: '',
          description: '',
          includes: []
        }
      ]
    }));
  };

  const updateItineraryDay = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleItineraryIncludes = (dayIndex, includeValue) => {
    console.log(`Handling include for day ${dayIndex}: ${includeValue}`);

    setFormData(prev => {
      const updatedItinerary = [...prev.itinerary];
      const currentDay = { ...updatedItinerary[dayIndex] };

      // Initialize includes array if it doesn't exist
      if (!currentDay.includes) {
        currentDay.includes = [];
      }

      // Check if the include already exists
      const includeExists = currentDay.includes.includes(includeValue);

      if (includeExists) {
        // Remove the include
        currentDay.includes = currentDay.includes.filter(item => item !== includeValue);
      } else {
        // Add the include
        currentDay.includes = [...currentDay.includes, includeValue];
      }

      // Update the day in the itinerary
      updatedItinerary[dayIndex] = currentDay;

      return {
        ...prev,
        itinerary: updatedItinerary
      };
    });

    setIncludesSearch("");
  };

  const addListItem = (listName) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], '']
    }));
  };

  const updateListItem = (listName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].map((item, i) => i === index ? value : item)
    }));
  };

  const removeListItem = (listName, index) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          question: '',
          answer: ''
        }
      ]
    }));
  };

  const updateFaq = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const removeFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const removeItinerary = (index) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (status) => {
    setSaving(status);
    setLoading('saveTour', true, status === 'published' ? 'Publishing tour...' : 'Saving tour...');

    if (!formData.title || formData.title === "") {
      showError("Title is required");
      setActiveTab('basic');
      setSaving(false);
      setLoading('saveTour', false);
      return;
    }

    if (!formData.slug || formData.slug === "") {
      showError("Slug is required");
      setActiveTab('basic');
      setSaving(false);
      setLoading('saveTour', false);
      return;
    }

    if (!formData.days || formData.days === "") {
      showError("Days is required*");
      setActiveTab('basic');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (!formData.nights || formData.nights === "") {
      showError("Nights is required*");
      setActiveTab('basic');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (!formData.rating || formData.rating === "") {
      showError("Rating is required*");
      setActiveTab('basic');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (!formData.maxGroupSize || formData.maxGroupSize === "") {
      showError("Group Size is required*");
      setActiveTab('basic');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (status === 'published' && (!formData.images || formData.images.length === 0)) {
      showError("At least one image is required for published tours");
      setActiveTab('basic');
      setSaving(false);
      setLoading('saveTour', false);
      return;
    }

    if (!formData.overview || formData.overview.trim() === "" || formData.overview === "<p></p>") {
      showError("Overview is required and cannot be empty");
      setActiveTab('details');
      setSaving(false);
      setLoading('saveTour', false);
      return;
    }

    if (!formData.additionalInfo || formData.additionalInfo.trim() === "" || formData.additionalInfo === "<p></p>") {
      showError("Additional Information is required and cannot be empty");
      setActiveTab('details');
      setSaving(false);
      setLoading('saveTour', false);
      return;
    }

    if (!formData.journey || formData.journey.length === 0) {
      showError("Journey is required*");
      setActiveTab('details');
      setSaving(false);
      setLoadign(false);
      return;
    }

    for (let i = 0; i < formData.journey.length; i++) {
      if (!formData.journey[i] || formData.journey[i] === "") {
        showError("Journey is required*");
        setActiveTab('details');
        setSaving(false);
        setLoadign(false);
        return;
      }
    }

    if (!formData.itinerary || formData.itinerary.length === 0) {
      showError("Itinerary is required*");
      setActiveTab('details');
      setSaving(false);
      setLoadign(false);
      return;
    }

    for (let i = 0; i < formData.itinerary.length; i++) {
      if (!formData.itinerary[i] || formData.itinerary[i] === "" || !formData.itinerary[i].title || formData.itinerary[i].title === "" || !formData.itinerary[i].description || formData.itinerary[i].description === "") {
        showError("Itinerary is required*");
        setActiveTab('details');
        setSaving(false);
        setLoadign(false);
        return;
      }
    }

    if (!formData.inclusions || formData.inclusions.length === 0) {
      showError("Inclusions are required*");
      setActiveTab('details');
      setSaving(false);
      setLoadign(false);
      return;
    }

    for (let i = 0; i < formData.inclusions.length; i++) {
      if (!formData.inclusions[i] || formData.inclusions[i] === "") {
        showError("Inclusions are required*");
        setActiveTab('details');
        setSaving(false);
        setLoadign(false);
        return;
      }
    }

    if (!formData.exclusions || formData.exclusions.length === 0) {
      showError("Exclusions are required*");
      setActiveTab('details');
      setSaving(false);
      setLoadign(false);
      return;
    }

    for (let i = 0; i < formData.exclusions.length; i++) {
      if (!formData.exclusions[i] || formData.exclusions[i] === "") {
        showError("Exclusions are required*");
        setActiveTab('details');
        setSaving(false);
        setLoadign(false);
        return;
      }
    }

    if (!formData.pricing || formData.pricing === "") {
      showError("Pricing is required*");
      setActiveTab('pricing');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (!formData.pricing.deluxe || formData.pricing.deluxe === "") {
      showError("Deluxe Pricing is required*");
      setActiveTab('pricing');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (!formData.pricing.deluxe.regularPrice || formData.pricing.deluxe.regularPrice === "" || !formData.pricing.deluxe.discountedPrice || formData.pricing.deluxe.discountedPrice === "" || !formData.pricing.deluxe.pricingInfo || formData.pricing.deluxe.pricingInfo === "" || !formData.pricing.deluxe.emiStartsFrom || formData.pricing.deluxe.emiStartsFrom === "" || !formData.pricing.deluxe.additionalEmiInfo || formData.pricing.deluxe.additionalEmiInfo === "") {
      showError("Deluxe Price is required*");
      setActiveTab('pricing');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (!formData.pricing.premium.regularPrice || formData.pricing.premium.regularPrice === "" || !formData.pricing.premium.discountedPrice || formData.pricing.premium.discountedPrice === "" || !formData.pricing.premium.pricingInfo || formData.pricing.premium.pricingInfo === "" || !formData.pricing.premium.emiStartsFrom || formData.pricing.premium.emiStartsFrom === "" || !formData.pricing.premium.additionalEmiInfo || formData.pricing.premium.additionalEmiInfo === "") {
      showError("Premium Price is required*");
      setActiveTab('pricing');
      setSaving(false);
      setLoadign(false);
      return;
    }

    if (!formData.pricing.luxury.regularPrice || formData.pricing.luxury.regularPrice === "" || !formData.pricing.luxury.discountedPrice || formData.pricing.luxury.discountedPrice === "" || !formData.pricing.luxury.pricingInfo || formData.pricing.luxury.pricingInfo === "" || !formData.pricing.luxury.emiStartsFrom || formData.pricing.luxury.emiStartsFrom === "" || !formData.pricing.luxury.additionalEmiInfo || formData.pricing.luxury.additionalEmiInfo === "") {
      showError("Luxury Price is required*");
      setActiveTab('pricing');
      setSaving(false);
      setLoadign(false);
      return;
    }

    // Validate HTML content length
    if (formData.overview.length > 65535) {
      showError("Overview content is too large (max 65KB)");
      setActiveTab('details');
      setSaving(false);
      setLoading('saveTour', false);
      return;
    }

    if (formData.additionalInfo.length > 65535) {
      showError("Additional Information content is too large (max 65KB)");
      setActiveTab('details');
      setSaving(false);
      setLoading('saveTour', false);
      return;
    }

    // Validate itinerary descriptions
    for (let i = 0; i < formData.itinerary.length; i++) {
      const day = formData.itinerary[i];
      if (!day.description || day.description.trim() === "" || day.description === "<p></p>") {
        showError(`Day ${i + 1} description is required and cannot be empty`);
        setActiveTab('details');
        setSaving(false);
        setLoading('saveTour', false);
        return;
      }
      if (day.description.length > 65535) {
        showError(`Day ${i + 1} description is too large (max 65KB)`);
        setActiveTab('details');
        setSaving(false);
        setLoading('saveTour', false);
        return;
      }
    }

    // Validate FAQ answers
    for (let i = 0; i < formData.faqs.length; i++) {
      const faq = formData.faqs[i];
      if (faq.question && (!faq.answer || faq.answer.trim() === "" || faq.answer === "<p></p>")) {
        showError(`FAQ ${i + 1} answer is required when question is provided`);
        setActiveTab('faqs');
        setSaving(false);
        setLoading('saveTour', false);
        return;
      }
      if (faq.answer && faq.answer.length > 65535) {
        showError(`FAQ ${i + 1} answer is too large (max 65KB)`);
        setActiveTab('faqs');
        setSaving(false);
        setLoading('saveTour', false);
        return;
      }
    }

    let data = JSON.stringify({
      status: status,
      title: formData.title || "",
      meta: JSON.stringify({
        title: formData.metaTitle || "",
        tags: formData.metaTags || "",
        extraTags: formData.extraMetaTags || ""
      }),
      time: JSON.stringify({
        days: formData.days || "",
        nights: formData.nights || ""
      }),
      slug: formData.slug || "",
      rating: formData.rating || "",
      minGroupSize: formData.maxGroupSize || "",
      destinations: JSON.stringify(formData.destinations || []),
      seasons: JSON.stringify(formData.seasons || []),
      themes: JSON.stringify(formData.themes || []),
      includes: JSON.stringify(formData.includes || []),
      customization: formData.customization || "",
      marking: formData.marking || "",
      overview: formData.overview || "",
      journey: JSON.stringify(formData.journey || []),
      itinerary: JSON.stringify(formData.itinerary || []),
      inclusions: JSON.stringify(formData.inclusions || []),
      exclusions: JSON.stringify(formData.exclusions || []),
      additionalInfo: formData.additionalInfo || "",
      pricing: JSON.stringify([
        {
          type: "deluxe",
          regular: formData.pricing.deluxe.regularPrice || "",
          discount: formData.pricing.deluxe.discountedPrice || "",
          info: formData.pricing.deluxe.pricingInfo || "",
          emi: formData.pricing.deluxe.emiStartsFrom || "",
          addInfo: formData.pricing.deluxe.additionalEmiInfo || ""
        },
        {
          type: "luxury",
          regular: formData.pricing.luxury.regularPrice || "",
          discount: formData.pricing.luxury.discountedPrice || "",
          info: formData.pricing.luxury.pricingInfo || "",
          emi: formData.pricing.luxury.emiStartsFrom || "",
          addInfo: formData.pricing.luxury.additionalEmiInfo || ""
        },
        {
          type: "premium",
          regular: formData.pricing.premium.regularPrice || "",
          discount: formData.pricing.premium.discountedPrice || "",
          info: formData.pricing.premium.pricingInfo || "",
          emi: formData.pricing.premium.emiStartsFrom || "",
          addInfo: formData.pricing.premium.additionalEmiInfo || ""
        }
      ]),
      faqs: JSON.stringify(formData.faqs || [])
    })

    try {
      const formData2 = new FormData();
      formData2.append('data', data);
      for (let i = 0; i < formData.images.length; i++) {
        formData2.append('images', formData.images[i]);
      }

      const dataPost = await fetch('https://data.tripknock.in/package/create', {
        method: 'POST',
        headers: {
          'admin': JSON.parse(Cookies.get('tk_auth_details')).email
        },
        body: formData2
      })
      const result = await dataPost.json();
      if (result.status === true) {
        showSuccess(result.message || 'Tour created successfully');
        router.push('/tours');
        setFormData({
          title: '',
          metaTitle: '',
          metaTags: '',
          extraMetaTags: '',
          days: '',
          nights: '',
          rating: '4.5',
          customization: 'yes',
          destinations: [],
          maxGroupSize: '',
          images: [],
          previewImages: [],
          seasons: [],
          themes: [],
          includes: [],
          journey: [''],
          marking: '',
          slug: '',

          overview: '',
          itinerary: [
            {
              day: 1,
              title: '',
              description: '',
              includes: []
            }
          ],
          inclusions: [''],
          exclusions: [''],
          additionalInfo: '',
          pricing: {
            deluxe: {
              regularPrice: '',
              discountedPrice: '',
              pricingInfo: '',
              emiStartsFrom: '',
              additionalEmiInfo: ''
            },
            premium: {
              regularPrice: '',
              discountedPrice: '',
              pricingInfo: '',
              emiStartsFrom: '',
              additionalEmiInfo: ''
            },
            luxury: {
              regularPrice: '',
              discountedPrice: '',
              pricingInfo: '',
              emiStartsFrom: '',
              additionalEmiInfo: ''
            }
          },
          faqs: [
            {
              question: '',
              answer: ''
            }
          ]
        })
      } else {
        showError(result.message || 'Failed to create tour');
      }
    } catch (error) {
      console.log('Error saving tour:', error);
      showError('An error occurred while saving tour');
    } finally {
      setSaving(false);
      setLoading('saveTour', false);
    }
  };

  return (
    <>
      {isLoading('loadData') ? <Loading /> :
        <div className="container mx-auto px-4 py-6" ref={sectionRef}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Create Tour</h1>
              <p className="text-secondary-600">Add a new tour package</p>
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
                {saving === 'draft' ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Public className="w-5 h-5" />
                {saving === 'published' ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>

          {/* {error.type === 'error' && <p className="text-red-500 mb-4 bg-red-100 rounded-xl p-4">{error.message}</p>}
          {error.type === 'success' && <p className="text-green-500 mb-4 bg-green-100 rounded-xl p-4">{error.message}</p>} */}

          <div className="bg-white rounded-xl shadow-sm">
            {/* Tabs */}
            <div className="border-b border-secondary-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                  py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap
                  ${activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                      }
                `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Basic Information Content */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          className="input-field w-full"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter tour title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Slug
                        </label>
                        <input
                          type="text"
                          name="slug"
                          className="input-field w-full"
                          value={formData.slug}
                          placeholder="Enter tour slug"
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Days Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Days
                      </label>
                      <input
                        type="number"
                        name="days"
                        value={formData.days}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Enter duration in days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Nights
                      </label>
                      <input
                        type="number"
                        name="nights"
                        value={formData.nights}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Enter duration in nights"
                      />
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Rating (ideal is 4.5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        className="input-field w-full"
                        value={formData.rating}
                        onChange={handleChange}
                        placeholder="Enter rating"
                        step="0.1"
                        min="0"
                        max="5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Minimum Group Size (ideal is 2)
                      </label>
                      <input
                        type="number"
                        name="maxGroupSize"
                        className="input-field w-full"
                        value={formData.maxGroupSize}
                        onChange={handleChange}
                        placeholder="Enter minimum group size"
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Destinations Input */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Destinations
                      </label>
                      <div ref={destinationRef} className="relative border border-secondary-300 rounded-lg p-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Show Selected Destinations */}
                          {formData.destinations.map((destination, index) => {
                            // Find the label for this destination ID/value
                            const destObj = DESTINATIONS.find(d => 
                              (typeof d === 'string' ? d : d.value) === destination
                            );
                            const displayName = destObj ? 
                              (typeof destObj === 'string' ? destObj : destObj.label) : 
                              destination;
                            
                            return (
                            <div
                              key={index}
                              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                            >
                                {displayName}
                              <button
                                type="button"
                                onClick={() =>
                                  handleMultiSelect('destinations', formData.destinations.filter(s => s !== destination))
                                }
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Close className="w-3 h-3" />
                              </button>
                            </div>
                            );
                          })}

                          {/* Search Input */}
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              name="destinationSearch"
                              className="w-full border-none focus:ring-0 p-1 text-sm"
                              value={destinationSearch}
                              onChange={(e) => {
                                setDestinationSearch(e.target.value);
                                setShowDestinations(true);
                              }}
                              placeholder={formData.destinations.length === 0 ? "Search destinations" : "+ Add another destination"}
                              onFocus={() => setShowDestinations(true)}
                            />
                          </div>
                        </div>

                        {/* Destination Dropdown */}
                        {showDestinations && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {DESTINATIONS.filter(
                              (destination) => {
                                // Handle both string and object formats
                                const destLabel = typeof destination === 'string' ? destination : destination.label;
                                const destValue = typeof destination === 'string' ? destination : destination.value;
                                return destLabel && destLabel.toLowerCase().includes(destinationSearch.toLowerCase()) &&
                                       !formData.destinations.includes(destValue);
                              }
                            ).map((destination, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-secondary-50 cursor-pointer flex items-center"
                                onClick={() => {
                                  const destValue = typeof destination === 'string' ? destination : destination.value;
                                  if (!formData.destinations.includes(destValue)) {
                                    handleMultiSelect('destinations', [...formData.destinations, destValue]);
                                    setDestinationSearch('');
                                    setShowDestinations(true); // Keep dropdown open
                                  }
                                }}
                              >
                                <Search className="w-4 h-4 mr-2 text-secondary-400" />
                                {typeof destination === 'string' ? destination : destination.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seasons Input */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Suitable Seasons
                      </label>
                      <div ref={seasonRef} className="relative border border-secondary-300 rounded-lg p-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          {formData.seasons.map((season, index) => (
                            <div
                              key={index}
                              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                            >
                              {SEASONS.find(s => s.value === season)?.label || season}
                              <button
                                type="button"
                                onClick={() => handleMultiSelect('seasons', formData.seasons.filter(s => s !== season))}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Close className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              className="w-full border-none focus:ring-0 p-1 text-sm"
                              value={seasonSearch}
                              onChange={(e) => {
                                setSeasonSearch(e.target.value);
                                setShowSeasons(true);
                              }}
                              placeholder={formData.seasons.length === 0 ? "Search seasons" : "+ Add another season"}
                              onFocus={() => setShowSeasons(true)}
                            />
                          </div>
                        </div>
                        {showSeasons && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {SEASONS
                              .filter(
                                season =>
                                  season.label.toLowerCase().includes(seasonSearch.toLowerCase()) &&
                                  !formData.seasons.includes(season.value)
                              )
                              .map((season, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-2 hover:bg-secondary-50 cursor-pointer flex items-center"
                                  onClick={() => {
                                    if (!formData.seasons.includes(season.value)) {
                                      handleMultiSelect('seasons', [...formData.seasons, season.value]);
                                      setSeasonSearch('');
                                    }
                                  }}
                                >
                                  <Search className="w-4 h-4 mr-2 text-secondary-400" />
                                  {season.label}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Themes Input */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Tour Themes
                      </label>
                      <div ref={themeRef} className="relative border border-secondary-300 rounded-lg p-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          {formData.themes.map((theme, index) => (
                            <div
                              key={index}
                              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                            >
                              {THEMES.find(t => t.value === theme)?.label || theme}
                              <button
                                type="button"
                                onClick={() => handleMultiSelect('themes', formData.themes.filter(t => t !== theme))}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Close className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              className="w-full border-none focus:ring-0 p-1 text-sm"
                              value={themeSearch}
                              onChange={(e) => {
                                setThemeSearch(e.target.value);
                                setShowThemes(true);
                              }}
                              placeholder={formData.themes.length === 0 ? "Search themes" : "+ Add another theme"}
                              onFocus={() => setShowThemes(true)}
                            />
                          </div>
                        </div>
                        {showThemes && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {THEMES
                              .filter(
                                theme =>
                                  theme.label.toLowerCase().includes(themeSearch.toLowerCase()) &&
                                  !formData.themes.includes(theme.value)
                              )
                              .map((theme, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-2 hover:bg-secondary-50 cursor-pointer flex items-center"
                                  onClick={() => {
                                    if (!formData.themes.includes(theme.value)) {
                                      handleMultiSelect('themes', [...formData.themes, theme.value]);
                                      setThemeSearch('');
                                    }
                                  }}
                                >
                                  <Search className="w-4 h-4 mr-2 text-secondary-400" />
                                  {theme.label}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tour Includes Input */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Tour Includes
                      </label>
                      <div ref={includesRef} className="relative border border-secondary-300 rounded-lg p-2">
                        <div className="flex flex-wrap gap-2 items-center">
                          {formData.includes.map((include, index) => (
                            <div
                              key={index}
                              className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                            >
                              {TOUR_INCLUDES.find(i => i.value === include)?.label || include}
                              <button
                                type="button"
                                onClick={() => handleMultiSelect('includes', formData.includes.filter(i => i !== include))}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Close className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              className="w-full border-none focus:ring-0 p-1 text-sm"
                              value={includesSearch}
                              onChange={(e) => {
                                setIncludesSearch(e.target.value);
                                setShowIncludes(true);
                              }}
                              placeholder={formData.includes.length === 0 ? "Search includes" : "+ Add another include"}
                              onFocus={() => setShowIncludes(true)}
                            />
                          </div>
                        </div>
                        {showIncludes && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {TOUR_INCLUDES
                              .filter(
                                include =>
                                  include.label.toLowerCase().includes(includesSearch.toLowerCase()) &&
                                  !formData.includes.includes(include.value)
                              )
                              .map((include, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-2 hover:bg-secondary-50 cursor-pointer flex items-center"
                                  onClick={() => {
                                    handleMultiSelect('includes', [...formData.includes, include.value]);
                                    setIncludesSearch('');
                                  }}
                                >
                                  <Search className="w-4 h-4 mr-2 text-secondary-400" />
                                  {include.label}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Customization
                      </label>
                      <select name="customization" className="input-field w-full" value={formData.customization} onChange={handleChange}>
                        <option value="no">no</option>
                        <option value="yes">yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Marking (optional)
                      </label>
                      <input
                        type="text"
                        name="marking"
                        className="input-field w-full"
                        value={formData.marking}
                        onChange={handleChange}
                        placeholder="Enter marking"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Tour Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <CloudUpload className="mx-auto h-12 w-12 text-secondary-400" />
                        <div className="flex text-sm text-secondary-600">
                          <label htmlFor="images" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                            <span>Upload files</span>
                            <input
                              id="images"
                              name="images"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleImageUpload}
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-secondary-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    {formData.previewImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {formData.previewImages.map((preview, index) => (
                          <div key={index} className="relative">
                            <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Delete className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      onClick={() => {
                        scrollToTop()
                        setActiveTab('details')
                      }}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next Tab
                      <SkipNextIcon className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* Overview */}
                  <div>
                    <label className="block text-xl font-medium text-secondary-700 mb-2">
                      Overview*
                    </label>
                    <HtmlEditor
                      value={formData.overview}
                      onChange={(value) => setFormData(prev => ({ ...prev, overview: value }))}
                    />
                  </div>

                  {/* Journey */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xl font-medium text-secondary-700">
                        Journey*
                      </label>
                    </div>
                    <div className="space-y-2">
                      {formData.journey.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateListItem('journey', index, e.target.value)}
                            className="input-field flex-1"
                            placeholder="Enter journey item"
                          />
                          {formData.journey.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeListItem('journey', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Delete className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addListItem('journey')}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Add className="w-4 h-4" /> Add Item
                      </button>
                    </div>
                  </div>

                  {/* Itinerary */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xl font-medium text-secondary-700">
                        Itinerary*
                      </label>
                    </div>
                    <div className="space-y-4">
                      {formData.itinerary.map((day, index) => (
                        <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div className="font-medium text-secondary-900 mb-2">Day {day.day}</div>
                            {formData.itinerary.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItinerary(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Delete className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div className='grid grid-cols-6 gap-4'>
                              <div className='col-span-3'>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={day.title}
                                  onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                                  className="input-field w-full"
                                  placeholder="Enter day title"
                                />
                              </div>
                              <div className="col-span-3">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                  Day {index + 1} Includes
                                </label>
                                <div ref={includesRef} className="relative border border-secondary-300 rounded-lg p-2">
                                  <div className="flex flex-wrap gap-2 items-center">
                                    {day.includes.map((include, includeIndex) => (
                                      <div
                                        key={includeIndex}
                                        className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center"
                                      >
                                        {TOUR_INCLUDES.find(i => i.value === include)?.label || include}
                                        <button
                                          type="button"
                                          onClick={() => handleItineraryIncludes(index, include)}
                                          className="ml-2 text-blue-600 hover:text-blue-800"
                                        >
                                          <Close className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                    <div className="flex-1 min-w-[200px]">
                                      <input
                                        type="text"
                                        className="w-full border-none focus:ring-0 p-1 text-sm"
                                        value={includesSearch}
                                        onChange={(e) => {
                                          setIncludesSearch(e.target.value);
                                          setShowIncludes(true);
                                        }}
                                        placeholder={day.includes.length === 0 ? "Search includes" : "+ Add another include"}
                                        onFocus={() => setShowIncludes(true)}
                                      />
                                    </div>
                                  </div>
                                  {showIncludes && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                      {TOUR_INCLUDES
                                        .filter(
                                          include =>
                                            include.label.toLowerCase().includes(includesSearch.toLowerCase()) &&
                                            !day.includes.includes(include.value)
                                        )
                                        .map((include, includeIndex) => (
                                          <div
                                            key={includeIndex}
                                            className="px-4 py-2 hover:bg-secondary-50 cursor-pointer flex items-center"
                                            onClick={() => {
                                              handleItineraryIncludes(index, include.value);
                                            }}
                                          >
                                            <Search className="w-4 h-4 mr-2 text-secondary-400" />
                                            {include.label}
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Description
                              </label>
                              <HtmlEditor
                                value={day.description}
                                onChange={(value) => updateItineraryDay(index, 'description', value)}
                              />
                            </div>

                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addItineraryDay}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Add className="w-4 h-4" /> Add Day
                      </button>
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xl font-medium text-secondary-700">
                        Inclusions*
                      </label>
                    </div>
                    <div className="space-y-2">
                      {formData.inclusions.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateListItem('inclusions', index, e.target.value)}
                            className="input-field flex-1"
                            placeholder="Enter inclusion item"
                          />
                          {formData.inclusions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeListItem('inclusions', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Delete className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addListItem('inclusions')}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Add className="w-4 h-4" /> Add Item
                      </button>
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xl font-medium text-secondary-700">
                        Exclusions*
                      </label>
                    </div>
                    <div className="space-y-2">
                      {formData.exclusions.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateListItem('exclusions', index, e.target.value)}
                            className="input-field flex-1"
                            placeholder="Enter exclusion item"
                          />
                          {formData.exclusions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeListItem('exclusions', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Delete className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addListItem('exclusions')}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Add className="w-4 h-4" /> Add Item
                      </button>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label className="block text-xl font-medium text-secondary-700 mb-2">
                      Additional Information*
                    </label>
                    <HtmlEditor
                      value={formData.additionalInfo}
                      onChange={(value) => setFormData(prev => ({ ...prev, additionalInfo: value }))}
                    />
                  </div>

                  <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                    <button
                      onClick={() => {
                        scrollToTop();
                        setActiveTab('basic')
                      }}
                      disabled={saving}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <SkipPreviousIcon className="w-5 h-5" />
                      Previous Tab
                    </button>
                    <button
                      onClick={() => {
                        scrollToTop();
                        setActiveTab('pricing')
                      }}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next Tab
                      <SkipNextIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-8">
                  {TOUR_TYPES.map((tourType) => (
                    <div key={tourType} className="mb-8">
                      <h3 className="text-lg font-medium text-secondary-800 mb-4">{tourType.charAt(0).toUpperCase() + tourType.slice(1)} Pricing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Regular Price (₹)
                          </label>
                          <input
                            type="number"
                            name={`pricing.${tourType}.regularPrice`}
                            className="input-field w-full"
                            value={formData.pricing[tourType].regularPrice}
                            onChange={(e) => handlePricingChange(tourType, 'regularPrice', e.target.value)}
                            placeholder="Enter regular price"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Discount in %
                          </label>
                          <input
                            type="number"
                            name={`pricing.${tourType}.discountedPrice`}
                            className="input-field w-full"
                            value={formData.pricing[tourType].discountedPrice}
                            onChange={(e) => handlePricingChange(tourType, 'discountedPrice', e.target.value)}
                            placeholder="Enter discounted price"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                        {/* <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Pricing Info
                          </label>
                          <input
                            type="text"
                            name={`pricing.${tourType}.pricingInfo`}
                            className="input-field w-full"
                            value={formData.pricing[tourType].pricingInfo}
                            onChange={(e) => handlePricingChange(tourType, 'pricingInfo', e.target.value)}
                            placeholder="Enter pricing info"
                          />
                        </div> */}
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Additional Info Banner
                          </label>
                          <input
                            type="text"
                            name={`pricing.${tourType}.emiStartsFrom`}
                            value={formData.pricing[tourType].emiStartsFrom}
                            onChange={(e) => handlePricingChange(tourType, 'emiStartsFrom', e.target.value)}
                            className="input-field w-full"
                            placeholder="Enter Additional Info Banner"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Additional Info i
                          </label>
                          <input
                            type="text"
                            name={`pricing.${tourType}.additionalEmiInfo`}
                            className="input-field w-full"
                            value={formData.pricing[tourType].additionalEmiInfo}
                            onChange={(e) => handlePricingChange(tourType, 'additionalEmiInfo', e.target.value)}
                            placeholder="Enter additional Info i"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                    <button
                      onClick={() => {
                        scrollToTop();
                        setActiveTab('details')
                      }}
                      disabled={saving}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <SkipPreviousIcon className="w-5 h-5" />
                      Previous Tab
                    </button>
                    <button
                      onClick={() => {
                        scrollToTop();
                        setActiveTab('faqs')
                      }}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next Tab
                      <SkipNextIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xl font-medium text-secondary-700">
                        Frequently Asked Questions
                      </label>
                    </div>
                    <div className="space-y-4">
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div className="font-medium text-secondary-900">FAQ #{index + 1}</div>
                            {formData.faqs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFaq(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Delete className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Question
                              </label>
                              <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                className="input-field w-full"
                                placeholder="Enter FAQ question"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Answer
                              </label>
                              <HtmlEditor
                                value={faq.answer}
                                onChange={(value) => updateFaq(index, 'answer', value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFaq}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Add className="w-4 h-4" /> Add FAQ
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 border-t-2 pt-8 flex justify-end gap-4">
                    <button
                      onClick={() => {
                        scrollToTop();
                        setActiveTab('pricing')
                      }}
                      disabled={saving}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <SkipPreviousIcon className="w-5 h-5" />
                      Previous Tab
                    </button>
                    <button
                      onClick={() => {
                        scrollToTop();
                        setActiveTab('review')
                      }}
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
                <div className="space-y-8">
                  <div className="bg-white rounded-lg">
                    <h2 className="text-xl font-medium text-secondary-900 mb-4">Review Tour Information</h2>

                    {/* Basic Info Section */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-secondary-800">Basic Information</h3>
                        <button
                          onClick={() => setActiveTab('basic')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Title</label>
                          <div className="mt-1 text-secondary-900">{formData.title || '-'}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Duration</label>
                          <div className="mt-1 text-secondary-900">{formData.days} Days {formData.nights} Nights</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Rating</label>
                          <div className="mt-1 text-secondary-900">{formData.rating}/5</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Minimum Group Size</label>
                          <div className="mt-1 text-secondary-900">{formData.maxGroupSize}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Destinations</label>
                          <div className="mt-1 text-secondary-900">
                            {formData.destinations.join(', ') || '-'}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Suitable Seasons</label>
                          <div className="mt-1 text-secondary-900">{formData.seasons.join(', ') || '-'}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Tour Themes</label>
                          <div className="mt-1 text-secondary-900">
                            {formData.themes.join(', ') || '-'}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Tour Includes</label>
                          <div className="mt-1 text-secondary-900">{formData.includes.join(', ') || '-'}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Customization</label>
                          <div className="mt-1 text-secondary-900">
                            {formData.customization}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Meta Title</label>
                          <div className="mt-1 text-secondary-900">{formData.metaTitle}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Meta Description</label>
                          <div className="mt-1 text-secondary-900">
                            {formData.metaTags}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Additional Meta Tags</label>
                          <div className="mt-1 text-secondary-900">{formData.extraMetaTags || '-'}</div>
                        </div>

                      </div>
                    </div>

                    {/* Images Preview */}
                    {formData.previewImages.length > 0 && (
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-secondary-800">Tour Images</h3>
                          <button
                            onClick={() => setActiveTab('basic')}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {formData.previewImages.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Tour image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Overview Section */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-secondary-800">Tour Details</h3>
                        <button
                          onClick={() => setActiveTab('details')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Overview</label>
                          <div className="mt-1 text-secondary-900" dangerouslySetInnerHTML={{ __html: formData.overview }}></div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Journey</label>
                          <div className="mt-1 text-secondary-900">
                            <ul>
                              {formData.journey.map((item, index) => (
                                <li key={index} className="pl-4 list-disc list-inside">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Itinerary</label>
                          <div className="mt-1 text-secondary-900">
                            {formData.itinerary.map((item, index) => (
                              <li key={index} className="pl-4 list-disc list-inside">
                                <p><b>{item.day}. {item.title}</b></p>
                                <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                              </li>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Inclusions</label>
                          <div className="mt-1 text-secondary-900">
                            <ul>
                              {formData.inclusions.map((item, index) => (
                                <li key={index} className="pl-4 list-disc list-inside">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Exclusions</label>
                          <div className="mt-1 text-secondary-900">
                            <ul>
                              {formData.exclusions.map((item, index) => (
                                <li key={index} className="pl-4 list-disc list-inside">{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700">Additional Information</label>
                          <div className="mt-1 text-secondary-900" dangerouslySetInnerHTML={{ __html: formData.additionalInfo }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-secondary-800">Pricing Details</h3>
                        <button
                          onClick={() => setActiveTab('pricing')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TOUR_TYPES.map((tourType) => (
                          <div key={tourType} className="p-4 bg-secondary-50 rounded-lg">
                            <h4 className="font-medium text-secondary-900 mb-2">
                              {tourType.charAt(0).toUpperCase() + tourType.slice(1)}
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-secondary-600">Regular Price:</span>
                                <span className="font-medium">₹{formData.pricing[tourType].regularPrice || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600">Discounted Price:</span>
                                <span className="font-medium">₹{formData.pricing[tourType].discountedPrice || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600">EMI From:</span>
                                <span className="font-medium">₹{formData.pricing[tourType].emiStartsFrom || '-'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQs Section */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-secondary-800">FAQs</h3>
                        <button
                          onClick={() => setActiveTab('faqs')}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-4">
                        {formData.faqs.map((faq, index) => (
                          <div key={index} className="border-b border-secondary-200 pb-4">
                            <div className="font-medium text-secondary-900">{faq.question}</div>
                            <div className="mt-2 prose max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer || '-' }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                      <button
                        onClick={() => {
                          scrollToTop();
                          setActiveTab('faqs')
                        }}
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
                        {saving === 'draft' ? 'Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={() => handleSubmit('published')}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Public className="w-5 h-5" />
                        {saving === 'published' ? 'Publishing...' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    </>
  );
}
