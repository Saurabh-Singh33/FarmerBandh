import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { notify } from '../../context/NotificationContext';

export const CsvExportButton = ({
  onExport,
  filename = 'export.csv',
  label = 'Export CSV',
  style = {}
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await onExport();
      
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notify.success('CSV export generated and downloaded.', 'Export Complete');
    } catch (err) {
      notify.error(err.message || 'Failed to export CSV file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0.45rem 0.85rem',
        borderRadius: '8px',
        border: '1px solid #CBD5E1',
        backgroundColor: '#FFFFFF',
        color: '#334155',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: isExporting ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!isExporting) {
          e.currentTarget.style.backgroundColor = '#F8FAFC';
          e.currentTarget.style.borderColor = '#94A3B8';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExporting) {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.borderColor = '#CBD5E1';
        }
      }}
    >
      {isExporting ? <Loader2 size={14} className="spin-animate" /> : <Download size={14} />}
      <span>{isExporting ? 'Generating...' : label}</span>
    </button>
  );
};

export default CsvExportButton;
