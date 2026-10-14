import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, Save, Edit2, CheckCircle, RefreshCw } from 'lucide-react';
import { adminCategoriesApi } from '../../services/adminApi';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { notify } from '../../context/NotificationContext';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminCategoriesApi.getCategories();
      setCategories(res || []);
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const moveCategory = (index, dir) => {
    const list = [...categories];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    const updated = list.map((c, i) => ({ ...c, displayOrder: i + 1 }));
    setCategories(updated);
  };

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      const orders = categories.map((c, idx) => ({ id: c.id, displayOrder: idx + 1 }));
      await adminCategoriesApi.reorderCategories(orders);
      notify.success('Category display order updated successfully.', 'Order Saved');
      fetchCategories();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to reorder categories.');
    } finally {
      setSavingOrder(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIconUrl('');
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setIconUrl(c.iconUrl || '');
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      setSubmitting(true);
      if (editingCategory) {
        await adminCategoriesApi.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: generatedSlug,
          description: description.trim() || null,
          iconUrl: iconUrl.trim() || null,
          isActive: editingCategory.isActive
        });
        notify.success('Category updated successfully.');
      } else {
        await adminCategoriesApi.createCategory({
          name: name.trim(),
          slug: generatedSlug,
          description: description.trim() || null,
          iconUrl: iconUrl.trim() || null,
          displayOrder: categories.length + 1,
          isActive: true
        });
        notify.success('Category created successfully.');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminCategoriesApi.deleteCategory(deleteTarget.id);
      notify.success(`Category '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="spin-animate" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading Categories...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.85rem', fontWeight: 700, color: '#1B4D3E', margin: 0 }}>
            Agricultural Categories
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Classify produce varieties (Grains, Pulses, Spices, Vegetables) and order browse menus.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Category
          </button>
          <button
            onClick={handleSaveOrder}
            disabled={savingOrder || categories.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: savingOrder ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={16} /> Save Order
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '0.85rem 1rem', width: '60px', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                ORDER
              </th>
              <th style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                CATEGORY NAME
              </th>
              <th style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                SLUG
              </th>
              <th style={{ padding: '0.85rem 1rem', width: '120px', textAlign: 'center', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                REORDER
              </th>
              <th style={{ padding: '0.85rem 1rem', width: '140px', textAlign: 'right', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 700, color: '#059669' }}>
                  #{idx + 1}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                  {c.description && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.description}</div>}
                </td>
                <td style={{ padding: '1rem', color: '#64748B', fontFamily: 'monospace' }}>
                  /{c.slug}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => moveCategory(idx, -1)}
                      disabled={idx === 0}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: idx === 0 ? '#CBD5E1' : '#334155',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveCategory(idx, 1)}
                      disabled={idx === categories.length - 1}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: idx === categories.length - 1 ? '#CBD5E1' : '#334155',
                        cursor: idx === categories.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                    <button
                      onClick={() => openEditModal(c)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFF',
                        color: '#334155',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #FECACA',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '460px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>
            <form onSubmit={handleSaveCategory}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pulses & Legumes"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Slug (URL parameter)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#FFF', fontWeight: 600 }}
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Delete category '${deleteTarget?.name}'? Crop listings under this category should be reassigned.`}
        confirmText="Delete Category"
        type="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Categories;
