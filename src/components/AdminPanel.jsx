import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [defaultTemplate, setDefaultTemplate] = useState(null);
  const [protectedFields, setProtectedFields] = useState([]);
  const [saving, setSaving] = useState(false);

  // Check admin status
  useEffect(() => {
    checkAdminStatus();
    loadSettings();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin-check');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
      setUserEmail(data.user || '');
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('https://invites-75e19-default-rtdb.firebaseio.com/settings.json');
      const settings = await response.json() || {};
      
      setDefaultTemplate(settings.defaultTemplate || {
        fields: [
          { id: 'event', label: 'Event', placeholder: 'Enter event name', visible: true, required: true },
          { id: 'from', label: 'From', placeholder: 'Your name', visible: true, required: false },
          { id: 'location', label: 'Location', placeholder: 'Event location', visible: true, required: false },
          { id: 'date', label: 'Date', placeholder: 'Event date', visible: true, required: false },
          { id: 'time', label: 'Time', placeholder: 'Event time', visible: true, required: false }
        ],
        theme: {
          primaryColor: '#10b981',
          backgroundColor: '#ffffff',
          textColor: '#111827'
        }
      });
      
      setProtectedFields(settings.protectedFields || ['event']);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateTemplate = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateType: 'defaultTemplate',
          templateData: defaultTemplate
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Template updated successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to update template');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateProtectedFields = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateType: 'protectedFields',
          templateData: protectedFields
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Protected fields updated!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to update protected fields');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleFieldVisibility = (fieldId) => {
    setDefaultTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { ...field, visible: !field.visible }
          : field
      )
    }));
  };

  const toggleFieldRequired = (fieldId) => {
    setDefaultTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { ...field, required: !field.required }
          : field
      )
    }));
  };

  const toggleProtectedField = (fieldId) => {
    setProtectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            {userEmail ? (
              <>You are logged in as <strong>{userEmail}</strong>, but you don't have admin access.</>
            ) : (
              'Please log in with Vercel Authentication to access this page.'
            )}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            To enable admin access, add your email to the ADMIN_EMAILS environment variable in Vercel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Logged in as: <strong>{userEmail}</strong></p>
        </div>

        {/* Default Template Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Default Template Fields</h2>
          
          <div className="space-y-4">
            {defaultTemplate?.fields?.map(field => (
              <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{field.label || field.id}</h3>
                  <div className="space-x-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={field.visible}
                        onChange={() => toggleFieldVisibility(field.id)}
                        className="form-checkbox text-emerald-500"
                      />
                      <span className="ml-2">Visible</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={() => toggleFieldRequired(field.id)}
                        className="form-checkbox text-emerald-500"
                      />
                      <span className="ml-2">Required</span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => {
                    setDefaultTemplate(prev => ({
                      ...prev,
                      fields: prev.fields.map(f => 
                        f.id === field.id 
                          ? { ...f, placeholder: e.target.value }
                          : f
                      )
                    }));
                  }}
                  placeholder="Placeholder text"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
          </div>

          <button
            onClick={updateTemplate}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>

        {/* Protected Fields Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Protected Fields</h2>
          <p className="text-gray-600 mb-4">
            Protected fields cannot be deleted by users when creating invitations.
          </p>
          
          <div className="space-y-2">
            {defaultTemplate?.fields?.map(field => (
              <label key={field.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={protectedFields.includes(field.id)}
                  onChange={() => toggleProtectedField(field.id)}
                  className="form-checkbox text-emerald-500"
                />
                <span className="ml-2">{field.label || field.id}</span>
              </label>
            ))}
          </div>

          <button
            onClick={updateProtectedFields}
            disabled={saving}
            className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Protected Fields'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;