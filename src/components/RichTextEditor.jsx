import React, { useRef, useState, useEffect } from 'react';

const RichTextEditor = ({
  initialValue = '',
  onChange,
  headerBackground = '#f9fafb',
  headerTextColor = '#374151',
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showTablePopover, setShowTablePopover] = useState(false);
  const [tableDimensions, setTableDimensions] = useState({
    rows: 2,
    cols: 2,
  });

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleFontSize = (e) => {
    execCommand('fontSize', e.target.value);
  };

  const handleColor = (e) => {
    execCommand('foreColor', e.target.value);
  };

  // Simple icon components
  const Icon = ({ children }) => (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
      }}
    >
      {children}
    </div>
  );

  const BoldIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
      </svg>
    </Icon>
  );

  const ItalicIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="4" x2="10" y2="4"></line>
        <line x1="14" y1="20" x2="5" y2="20"></line>
        <line x1="15" y1="4" x2="9" y2="20"></line>
      </svg>
    </Icon>
  );

  const ListIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    </Icon>
  );

  const AlignLeftIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="17" y1="10" x2="3" y2="10"></line>
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="21" y1="14" x2="3" y2="14"></line>
        <line x1="17" y1="18" x2="3" y2="18"></line>
      </svg>
    </Icon>
  );

  const AlignCenterIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="10" x2="6" y2="10"></line>
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="21" y1="14" x2="3" y2="14"></line>
        <line x1="18" y1="18" x2="6" y2="18"></line>
      </svg>
    </Icon>
  );

  const AlignRightIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="21" y1="10" x2="7" y2="10"></line>
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="21" y1="14" x2="3" y2="14"></line>
        <line x1="21" y1="18" x2="7" y2="18"></line>
      </svg>
    </Icon>
  );

  const TableIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    </Icon>
  );

  const PlusIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </Icon>
  );

  const TrashIcon = () => (
    <Icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </Icon>
  );

  const formatButton = (icon, command, title) => (
    <button
      type="button"
      onClick={() => execCommand(command)}
      style={{
        padding: '0.5rem',
        borderRadius: '0.375rem',
        transition: 'background-color 0.2s',
        color: headerTextColor,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
      onMouseOut={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
      title={title}
    >
      {icon}
    </button>
  );

  const createTable = () => {
    const { rows, cols } = tableDimensions;
    let tableHTML =
      '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">';

    // Create header row
    tableHTML += '<thead><tr>';
    for (let j = 0; j < cols; j++) {
      tableHTML +=
        '<th style="border: 1px solid #d1d5db; padding: 0.5rem; background-color: #f9fafb;">Header ' +
        (j + 1) +
        '</th>';
    }
    tableHTML += '</tr></thead><tbody>';

    // Create body rows
    for (let i = 0; i < rows - 1; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML +=
          '<td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cell ' +
          (j + 1) +
          '</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';

    // Insert table at cursor position or at the end
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const tableElement = document.createElement('div');
      tableElement.innerHTML = tableHTML;
      range.insertNode(tableElement);
    } else if (editorRef.current) {
      editorRef.current.innerHTML += tableHTML;
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    setShowTablePopover(false);
  };

  const handleTableOperation = (operation) => {
    const selection = window.getSelection();
    if (!selection) return;

    const cell = selection.anchorNode?.parentElement;
    if (!cell) return;

    const row = cell.closest('tr');
    const table = cell.closest('table');

    if (!row || !table) return;

    switch (operation) {
      case 'addRow':
        const newRow = row.cloneNode(true);
        Array.from(newRow.cells).forEach((cell) => (cell.textContent = ''));
        row.after(newRow);
        break;
      case 'addColumn':
        const columnIndex = Array.from(row.cells).indexOf(cell);
        Array.from(table.rows).forEach((row) => {
          const newCell = document.createElement(
            row.parentElement?.tagName === 'THEAD' ? 'th' : 'td'
          );
          newCell.style.border = '1px solid #d1d5db';
          newCell.style.padding = '0.5rem';
          row.cells[columnIndex].after(newCell);
        });
        break;
      case 'deleteRow':
        if (table.rows.length > 2) {
          row.remove();
        }
        break;
      case 'deleteColumn':
        if (row.cells.length > 1) {
          const columnIndex = Array.from(row.cells).indexOf(cell);
          Array.from(table.rows).forEach((row) =>
            row.cells[columnIndex].remove()
          );
        }
        break;
    }

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle editor input events correctly
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Custom button component
  const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
  }) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '500',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s, border-color 0.2s',
      border: 'none',
    };

    const variants = {
      primary: {
        backgroundColor: '#3b82f6',
        color: 'white',
        '&:hover': { backgroundColor: '#2563eb' },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: '1px solid #d1d5db',
        '&:hover': { backgroundColor: '#f3f4f6' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#374151',
        '&:hover': { backgroundColor: '#f3f4f6' },
      },
    };

    const sizes = {
      sm: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
      md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    };

    const style = {
      ...baseStyle,
      ...variants[variant],
      ...sizes[size],
    };

    return (
      <button
        style={style}
        onClick={onClick}
        onMouseOver={(e) => {
          if (variant === 'primary')
            e.currentTarget.style.backgroundColor = '#2563eb';
          if (variant === 'outline' || variant === 'ghost')
            e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
        onMouseOut={(e) => {
          if (variant === 'primary')
            e.currentTarget.style.backgroundColor = '#3b82f6';
          if (variant === 'outline')
            e.currentTarget.style.backgroundColor = 'transparent';
          if (variant === 'ghost')
            e.currentTarget.style.backgroundColor = 'transparent';
        }}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Custom input component
  const Input = ({ type = 'text', onChange, value, min, ...props }) => {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        style={{
          display: 'block',
          width: '100%',
          padding: '0.5rem',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
        }}
        {...props}
      />
    );
  };

  // Custom popover component
  const TablePopover = () => {
    if (!showTablePopover) return null;

    return (
      <div
        style={{
          position: 'absolute',
          zIndex: 50,
          backgroundColor: 'white',
          borderRadius: '0.375rem',
          boxShadow:
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          width: '20rem',
          border: '1px solid #e5e7eb',
          padding: '1rem',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
            Insert Table
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem',
                }}
              >
                Rows
              </label>
              <Input
                type="number"
                min="2"
                value={tableDimensions.rows}
                onChange={(e) =>
                  setTableDimensions((prev) => ({
                    ...prev,
                    rows: parseInt(e.target.value) || 2,
                  }))
                }
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem',
                }}
              >
                Columns
              </label>
              <Input
                type="number"
                min="1"
                value={tableDimensions.cols}
                onChange={(e) =>
                  setTableDimensions((prev) => ({
                    ...prev,
                    cols: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <Button onClick={createTable} style={{ width: '100%' }}>
              Insert Table
            </Button>
          </div>
        </div>
        <div>
          <h4 style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
            Table Operations
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTableOperation('addRow')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <PlusIcon /> Add Row
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTableOperation('addColumn')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <PlusIcon /> Add Column
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTableOperation('deleteRow')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <TrashIcon /> Delete Row
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTableOperation('deleteColumn')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <TrashIcon /> Delete Column
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Click outside handler for popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showTablePopover &&
        !event.target.closest('.table-popover-container')
      ) {
        setShowTablePopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTablePopover]);

  const divider = (
    <div
      style={{
        height: '1rem',
        width: '1px',
        backgroundColor: '#d1d5db',
        margin: '0 0.5rem',
      }}
    />
  );

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        boxShadow: isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid #e5e7eb',
          padding: '0.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          backgroundColor: headerBackground,
          color: headerTextColor,
        }}
      >
        <select
          onChange={handleFontSize}
          style={{
            padding: '0.25rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            backgroundColor: 'white',
          }}
          title="Font Size"
        >
          <option value="3">Normal</option>
          <option value="1">Small</option>
          <option value="4">Large</option>
          <option value="5">Extra Large</option>
        </select>

        <input
          type="color"
          onChange={handleColor}
          style={{
            width: '2rem',
            height: '2rem',
            padding: '0.25rem',
            cursor: 'pointer',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
          }}
          title="Text Color"
        />

        {divider}

        {formatButton(<BoldIcon />, 'bold', 'Bold')}
        {formatButton(<ItalicIcon />, 'italic', 'Italic')}

        {divider}

        {formatButton(<AlignLeftIcon />, 'justifyLeft', 'Align Left')}
        {formatButton(<AlignCenterIcon />, 'justifyCenter', 'Align Center')}
        {formatButton(<AlignRightIcon />, 'justifyRight', 'Align Right')}

        {divider}

        {formatButton(<ListIcon />, 'insertUnorderedList', 'Bullet List')}

        {divider}

        <div
          className="table-popover-container"
          style={{ position: 'relative' }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTablePopover(!showTablePopover)}
            style={{ padding: '0.5rem' }}
          >
            <TableIcon />
          </Button>
          {showTablePopover && <TablePopover />}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          padding: '1rem',
          minHeight: '200px',
          outline: 'none',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
