import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { setAllTags } from '../store/productSlice';
import { toast } from 'react-hot-toast';

const Tags = () => {
  const dispatch = useDispatch();
  const tags = useSelector((state) => state.product.allTags);

  const [tagForm, setTagForm] = useState({
    _id: '',
    name: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getTags,
      });
      if (response.data.success) {
        dispatch(setAllTags(response.data.data));
      }
    } catch (error) {
      toast.error('Failed to fetch tags');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTagForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = isEditing
      ? { _id: tagForm._id, name: tagForm.name }
      : { name: tagForm.name };

    try {
      const apiCall = isEditing ? SummaryApi.updateTags : SummaryApi.addTags;

      const response = await Axios({
        ...apiCall,
        data: payload,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.success) {
        toast.success(
          isEditing ? 'Tag updated successfully' : 'Tag added successfully'
        );
        fetchTags();
        setTagForm({ _id: '', name: '' });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tag');
    }
  };

  const handleEdit = (tag) => {
    setTagForm({
      _id: tag._id,
      name: tag.name,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteTags,
        data: { _id: id },
      });

      if (response.data.success) {
        toast.success('Tag deleted successfully');
        fetchTags();
      }
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        {isEditing ? 'Edit Tag' : 'Add New Tag'}
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">Tag Name</label>
          <input
            type="text"
            name="name"
            value={tagForm.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-secondary-200 text-white px-4 py-2 rounded hover:bg-secondary-100"
          >
            {isEditing ? 'Update Tag' : 'Add Tag'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setTagForm({ _id: '', name: '' });
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
        <h3 className="text-xl font-semibold mb-4">Existing Tags</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Slug</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag._id} className="hover:bg-gray-50">
                <td className="p-2 border">{tag.name}</td>
                <td className="p-2 border">{tag.slug}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="mr-2 text-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tag._id)}
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

export default Tags;
