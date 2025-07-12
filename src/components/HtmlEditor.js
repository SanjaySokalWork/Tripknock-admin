import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const FroalaEditor = dynamic(() => import('react-froala-wysiwyg'), { ssr: false });

export default function HtmlEditor({ 
  value, 
  onChange, 
  height = 300, 
  placeholder = "Edit Your Content Here!",
  readOnly = false,
  theme = 'default' // 'default' or 'dark'
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Import Froala plugins and styles only on client side
    const loadFroalaAssets = async () => {
      try {
        // Import plugins
        await import('froala-editor/js/plugins/align.min.js');
        await import('froala-editor/js/plugins/code_beautifier.min.js');
        await import('froala-editor/js/plugins/code_view.min.js');
        await import('froala-editor/js/plugins/colors.min.js');
        await import('froala-editor/js/plugins/emoticons.min.js');
        await import('froala-editor/js/plugins/font_size.min.js');
        await import('froala-editor/js/plugins/line_height.min.js');
        await import('froala-editor/js/plugins/table.min.js');
        await import('froala-editor/js/plugins/video.min.js');
        await import('froala-editor/js/plugins/url.min.js');
        await import('froala-editor/js/plugins/quote.min.js');
        await import('froala-editor/js/plugins/special_characters.min.js');
        await import('froala-editor/js/plugins/word_paste.min.js');
        await import('froala-editor/js/plugins/paragraph_format.min.js');
        await import('froala-editor/js/plugins/paragraph_style.min.js');

        // Import styles
        await import('froala-editor/css/froala_style.min.css');
        await import('froala-editor/css/froala_editor.pkgd.min.css');
        await import('froala-editor/css/plugins/table.min.css');
        await import('froala-editor/css/plugins/colors.min.css');
        await import('froala-editor/css/plugins/emoticons.min.css');
        await import('froala-editor/css/plugins/special_characters.min.css');
        await import('froala-editor/css/plugins/video.min.css');
        
        if (theme === 'dark') {
          await import('froala-editor/css/themes/dark.min.css');
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Froala assets:', error);
        setIsLoaded(true); // Set to true anyway to prevent infinite loading
      }
    };

    loadFroalaAssets();
  }, [theme]);

  // Don't render the editor until all assets are loaded
  if (!isLoaded) {
    return (
      <div 
        style={{ 
          height: height, 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          color: '#666'
        }}
      >
        Loading editor...
      </div>
    );
  }

  const config = {
    placeholderText: placeholder,
    charCounterCount: true,
    height: height,
    theme: theme,
    readOnly: readOnly,
    // Enhanced paragraph formats including all heading levels
    paragraphFormat: {
      N: 'Normal',
      H1: 'Heading 1',
      H2: 'Heading 2',
      H3: 'Heading 3',
      H4: 'Heading 4',
      H5: 'Heading 5',
      H6: 'Heading 6',
      PRE: 'Code',
      BLOCKQUOTE: 'Quote'
    },
    // Custom paragraph styles
    paragraphStyles: {
      'fr-text-gray': 'Gray',
      'fr-text-bordered': 'Bordered',
      'fr-text-spaced': 'Spaced',
      'fr-text-uppercase': 'Uppercase',
      'fr-text-bold': 'Bold Text',
      'fr-text-italic': 'Italic Text',
      'fr-text-subtle': 'Subtle Text'
    },
    tableStyles: {
      'table-bordered': 'Bordered',
      'table-striped': 'Striped',
      'table-hover': 'Hover',
      'table-condensed': 'Condensed'
    },
    // Word paste handling
    wordPasteModal: false,
    wordPasteKeepFormatting: true,
    pastePlain: false,
    // Disable all image and file upload features
    imageUpload: false,
    imageInsertButtons: [],
    imageAllowedTypes: [],
    imageMaxSize: 0,
    imagePaste: false,
    imageResize: false,
    imagePasteProcess: false,
    fileUpload: false,
    filesManagerMaxSize: 0,
    filesManagerAllowedTypes: [],
    dragInline: false,
    pasteDeniedTags: ['img'],
    pasteDeniedAttrs: ['src'],
    events: {
      'drop': function (e) {
        e.preventDefault();
        return false;
      },
      'paste.before': function () {
        // Preserve formatting on paste but block images
        return true;
      },
      'paste.afterCleanup': function (html) {
        // Remove any img tags that might have been pasted
        return html.replace(/<img[^>]*>/gi, '');
      }
    },
    colorsBackground: [
      // Material Design Colors
      '#FFFFFF', // White
      '#F5F5F5', // Light Gray
      '#FFEBEE', // Red 50
      '#FCE4EC', // Pink 50
      '#F3E5F5', // Purple 50
      '#EDE7F6', // Deep Purple 50
      '#E8EAF6', // Indigo 50
      '#E3F2FD', // Blue 50
      '#E1F5FE', // Light Blue 50
      '#E0F7FA', // Cyan 50
      '#E0F2F1', // Teal 50
      '#E8F5E9', // Green 50
      '#F1F8E9', // Light Green 50
      '#F9FBE7', // Lime 50
      '#FFFDE7', // Yellow 50
      '#FFF8E1', // Amber 50
      '#FFF3E0', // Orange 50
      '#FBE9E7', // Deep Orange 50
      '#EFEBE9', // Brown 50
      '#ECEFF1', // Blue Gray 50
      
      // Darker Shades
      '#FFCDD2', // Red 100
      '#F8BBD0', // Pink 100
      '#E1BEE7', // Purple 100
      '#D1C4E9', // Deep Purple 100
      '#C5CAE9', // Indigo 100
      '#BBDEFB', // Blue 100
      '#B3E5FC', // Light Blue 100
      '#B2EBF2', // Cyan 100
      '#B2DFDB', // Teal 100
      '#C8E6C9', // Green 100
      '#DCEDC8', // Light Green 100
      '#F0F4C3', // Lime 100
      '#FFF9C4', // Yellow 100
      '#FFECB3', // Amber 100
      '#FFE0B2', // Orange 100
      '#FFCCBC', // Deep Orange 100
      '#D7CCC8', // Brown 100
      '#CFD8DC'  // Blue Gray 100
    ],
    colorsText: [
      // Material Design Colors - Dark Variants
      '#000000', // Black
      '#424242', // Gray 800
      '#D32F2F', // Red
      '#C2185B', // Pink
      '#7B1FA2', // Purple
      '#512DA8', // Deep Purple
      '#303F9F', // Indigo
      '#1976D2', // Blue
      '#0288D1', // Light Blue
      '#0097A7', // Cyan
      '#00796B', // Teal
      '#388E3C', // Green
      '#689F38', // Light Green
      '#AFB42B', // Lime
      '#FBC02D', // Yellow
      '#FFA000', // Amber
      '#F57C00', // Orange
      '#E64A19', // Deep Orange
      '#5D4037', // Brown
      '#455A64', // Blue Gray
      
      // Lighter Variants
      '#EF5350', // Red 400
      '#EC407A', // Pink 400
      '#AB47BC', // Purple 400
      '#7E57C2', // Deep Purple 400
      '#5C6BC0', // Indigo 400
      '#42A5F5', // Blue 400
      '#29B6F6', // Light Blue 400
      '#26C6DA', // Cyan 400
      '#26A69A', // Teal 400
      '#66BB6A', // Green 400
      '#9CCC65', // Light Green 400
      '#D4E157', // Lime 400
      '#FFEE58', // Yellow 400
      '#FFCA28', // Amber 400
      '#FFA726', // Orange 400
      '#FF7043', // Deep Orange 400
      '#8D6E63', // Brown 400
      '#78909C'  // Blue Gray 400
    ],
    colorsStep: 7,
    colorsDefaultTab: 'text',
    colorsButtons: ['colorsBack', '|', 'colorsText'],
    toolbarButtons: {
      moreText: {
        buttons: [
          'bold', 
          'italic', 
          'underline', 
          'strikeThrough', 
          'subscript', 
          'superscript',
          '|',
          'fontSize',
          'textColor',
          'backgroundColor',
          '|',
          'clearFormatting'
        ],
        align: 'left',
        buttonsVisible: 4
      },
      moreParagraph: {
        buttons: [
          'paragraphFormat',
          'paragraphStyle',
          'alignLeft',
          'alignCenter',
          'alignRight',
          'alignJustify',
          'formatOL',
          'formatUL',
          'lineHeight',
          'outdent',
          'indent',
          'quote'
        ],
        align: 'left',
        buttonsVisible: 3
      },
      moreRich: {
        buttons: ['insertLink', 'insertTable', 'emoticons', 'specialCharacters', 'insertHR'],
        align: 'left',
        buttonsVisible: 3
      },
      moreMisc: {
        buttons: ['undo', 'redo', 'fullscreen', 'print', 'spellChecker', 'selectAll', 'html', 'help'],
        align: 'right',
        buttonsVisible: 2
      }
    },
    // Make color picker always visible in toolbar
    toolbarVisibleButtons: ['textColor', 'backgroundColor'],
    // Quick colors for text and background
    quickColorsText: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'],
    quickColorsBackground: ['#FFFFFF', '#FFEFEF', '#EFFFEF', '#EFEFFF', '#FFFFEF', '#FFEFFF', '#EFFFFF', '#FFE0E0', '#E0FFE0', '#E0E0FF', '#FFFFE0', '#FFE0FF']
  };

  return (
    <div className="froala-editor-container">
      <style jsx global>{`
        .fr-box.fr-basic .fr-element {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .fr-element h1 {
          font-size: 2.5em;
          margin-bottom: 0.5em;
        }
        .fr-element h2 {
          font-size: 2em;
          margin-bottom: 0.5em;
        }
        .fr-element h3 {
          font-size: 1.75em;
          margin-bottom: 0.5em;
        }
        .fr-element h4 {
          font-size: 1.5em;
          margin-bottom: 0.5em;
        }
        .fr-element h5 {
          font-size: 1.25em;
          margin-bottom: 0.5em;
        }
        .fr-element h6 {
          font-size: 1em;
          margin-bottom: 0.5em;
        }
        .fr-text-bordered {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 4px;
        }
        .fr-text-spaced {
          letter-spacing: 1px;
          line-height: 1.6;
        }
        .fr-text-uppercase {
          text-transform: uppercase;
        }

        /* Enhanced color picker styles */
        .fr-popup .fr-color-set {
          line-height: 1.5;
          margin: 5px;
        }

        .fr-popup .fr-color-hex-layer {
          width: 100%;
          margin: 0;
          padding: 10px;
        }

        .fr-popup .fr-color-set > span {
          display: inline-block;
          width: 24px;
          height: 24px;
          position: relative;
          z-index: 1;
          margin: 2px;
          border-radius: 4px;
          cursor: pointer;
        }

        .fr-popup .fr-color-set > span:hover {
          transform: scale(1.1);
          z-index: 2;
        }

        .fr-popup .fr-color-set > span.fr-selected-color {
          outline: 2px solid #1e88e5;
          outline-offset: 2px;
        }
      `}</style>
      <FroalaEditor
        tag="textarea"
        config={config}
        model={value}
        onModelChange={onChange}
      />
    </div>
  );
}
