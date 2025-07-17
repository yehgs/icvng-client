// client/src/components/address/AddressFormModal.jsx - Modal wrapper for AddressForm
import React from 'react';
import { X } from 'lucide-react';
import AddressForm from './AddressForm';

const AddressFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  title = null,
}) => {
  if (!isOpen) return null;

  const modalTitle =
    title || (initialData ? 'Edit Address' : 'Add New Address');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {modalTitle}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {initialData
                ? 'Update your address information'
                : 'Add a new delivery address to your account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <AddressForm
            onSubmit={onSubmit}
            onCancel={onClose}
            initialData={initialData}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFormModal;
