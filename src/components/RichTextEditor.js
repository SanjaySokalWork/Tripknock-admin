'use client';

import { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function RichTextEditor({ value, onChange, height = 300 }) {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    if (value) {
      try {
        const contentState = convertFromRaw(JSON.parse(value));
        setEditorState(EditorState.createWithContent(contentState));
      } catch (e) {
        console.log('Error parsing editor content:', e);
      }
    }
  }, []);

  const handleEditorChange = (newState) => {
    setEditorState(newState);
    const content = convertToRaw(newState.getCurrentContent());
    onChange(JSON.stringify(content));
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  return (
    <div className="border border-secondary-200 rounded-lg overflow-hidden">
      <div className="bg-secondary-50 border-b border-secondary-200 p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => toggleInlineStyle('BOLD')}
          className="p-1 hover:bg-secondary-100 rounded"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={() => toggleInlineStyle('ITALIC')}
          className="p-1 hover:bg-secondary-100 rounded"
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={() => toggleInlineStyle('UNDERLINE')}
          className="p-1 hover:bg-secondary-100 rounded"
        >
          <span className="underline">U</span>
        </button>
        <div className="w-px h-6 bg-secondary-200 mx-1" />
        <button
          type="button"
          onClick={() => toggleBlockType('header-one')}
          className="p-1 hover:bg-secondary-100 rounded"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => toggleBlockType('header-two')}
          className="p-1 hover:bg-secondary-100 rounded"
        >
          H2
        </button>
        <div className="w-px h-6 bg-secondary-200 mx-1" />
        <button
          type="button"
          onClick={() => toggleBlockType('unordered-list-item')}
          className="p-1 hover:bg-secondary-100 rounded"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => toggleBlockType('ordered-list-item')}
          className="p-1 hover:bg-secondary-100 rounded"
        >
          1. List
        </button>
      </div>
      <div 
        style={{ height }} 
        className="p-4 overflow-y-auto"
      >
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}
