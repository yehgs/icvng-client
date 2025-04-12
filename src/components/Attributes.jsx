import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { setAllAttributes } from '../store/productSlice';
import { toast } from 'react-hot-toast';

const Attributes = () => {
  const dispatch = useDispatch();
  const attributes = useSelector((state) => state.product.allAttributes);

  const [attributeForm, setAttributeForm] = useState({
    _id: '',
    name: '',
    values: [],
  });
  const [newValue, setNewValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchAttributes = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getAttribute,
      });
      if (response.data.success) {
        dispatch(setAllAttributes(response.data.data));
      }
    } catch (error) {
      toast.error('Failed to fetch attributes');
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttributeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddValue = () => {
    if (newValue && !attributeForm.values.includes(newValue)) {
      setAttributeForm((prev) => ({
        ...prev,
        values: [...prev.values, newValue],
      }));
      setNewValue('');
    }
  };

  const handleRemoveValue = (valueToRemove) => {
    setAttributeForm((prev) => ({
      ...prev,
      values: prev.values.filter((value) => value !== valueToRemove),
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const apiCall = isEditing
  //       ? SummaryApi.updateAttribute
  //       : SummaryApi.addAttribute;

  //     const response = await Axios({
  //       ...apiCall,
  //       data: attributeForm,
  //     });

  //     if (response.data.success) {
  //       toast.success(
  //         isEditing
  //           ? 'Attribute updated successfully'
  //           : 'Attribute added successfully'
  //       );
  //       fetchAttributes();
  //       // Reset form
  //       setAttributeForm({ _id: '', name: '', values: [] });
  //       setIsEditing(false);
  //     }
  //   } catch (error) {
  //     toast.error('Failed to save attribute');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting Attribute:', attributeForm);

    try {
      const apiCall = isEditing
        ? SummaryApi.updateAttribute
        : SummaryApi.addAttribute;

      const response = await Axios({
        ...apiCall,
        data: attributeForm,
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        toast.success(
          isEditing
            ? 'Attribute updated successfully'
            : 'Attribute added successfully'
        );
        fetchAttributes();
        setAttributeForm({ _id: '', name: '', values: [] });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error('Failed to save attribute');
    }
  };

  const handleEdit = (attribute) => {
    setAttributeForm({
      _id: attribute._id,
      name: attribute.name,
      values: attribute.values,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteAttribute,
        data: { _id: id },
      });

      if (response.data.success) {
        toast.success('Attribute deleted successfully');
        fetchAttributes();
      }
    } catch (error) {
      toast.error('Failed to delete attribute');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? 'Edit Attribute' : 'Add New Attribute'}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">Attribute Name</label>
          <input
            type="text"
            name="name"
            value={attributeForm.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Attribute Values</label>
          <div className="flex">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full p-2 border rounded mr-2"
              placeholder="Enter value"
            />
            <button
              type="button"
              onClick={handleAddValue}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Value
            </button>
          </div>
        </div>

        {attributeForm.values.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Current Values:</h3>
            <div className="flex flex-wrap gap-2">
              {attributeForm.values.map((value) => (
                <span
                  key={value}
                  className="bg-gray-200 px-2 py-1 rounded flex items-center"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(value)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-secondary-200 text-white px-4 py-2 rounded"
          >
            {isEditing ? 'Update Attribute' : 'Add Attribute'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setAttributeForm({ _id: '', name: '', values: [] });
                setIsEditing(false);
              }}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-4">Existing Attributes</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Values</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((attribute) => (
              <tr key={attribute._id} className="hover:bg-gray-50">
                <td className="p-2 border">{attribute.name}</td>
                <td className="p-2 border">{attribute.values.join(', ')}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(attribute)}
                    className="mr-2 text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(attribute._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attributes;
