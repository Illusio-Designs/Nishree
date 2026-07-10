'use client';

import { useEffect, useState } from 'react';
import { mediaUrl } from '@/lib/api';
import { firstImage, productPricing, formatPrice, variationLabel } from '@/lib/format';
import StatusPill from '@/components/admin/StatusPill';
import ResourceManager from '@/components/admin/ResourceManager';
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminListCategories,
} from '@/lib/admin-api';

export default function ProductsPage() {
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    adminListCategories()
      .then((cats) => setCategoryOptions((Array.isArray(cats) ? cats : []).map((c) => ({ value: String(c.id), label: c.name }))))
      .catch(() => {});
  }, []);

  return (
    <ResourceManager
      title="Products"
      subtitle="Manage your catalogue."
      fetchList={adminListProducts}
      createItem={adminCreateProduct}
      updateItem={adminUpdateProduct}
      deleteItem={adminDeleteProduct}
      searchKeys={['name']}
      addLabel="Add product"
      columns={[
        {
          key: 'name',
          label: 'Product',
          render: (p) => (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-lg bg-surface-soft">
                {firstImage(p) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(firstImage(p))} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <span className="font-semibold text-ink clamp-1">{p.name}</span>
            </div>
          ),
        },
        { key: 'price', label: 'From', render: (p) => formatPrice(productPricing(p).price) },
        { key: 'packs', label: 'Pack sizes', render: (p) => (p.ProductVariations || p.variations || []).length || 1 },
        { key: 'category', label: 'Category', render: (p) => p.category?.name || p.Category?.name || '—' },
        { key: 'status', label: 'Status', render: (p) => <StatusPill status={p.status} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, colSpan: 2 },
        { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categoryOptions },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'draft', label: 'Draft' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'variations', label: 'Pack sizes', type: 'variations' },
        { name: 'images', label: 'Image', type: 'image', colSpan: 2 },
      ]}
      toFormValues={(p) => ({
        name: p.name,
        categoryId: String(p.categoryId || p.category?.id || ''),
        status: p.status || 'active',
        description: p.description || '',
        images: firstImage(p),
        variations: (p.ProductVariations || p.variations || []).map((vr) => {
          let attrs = vr.attributes;
          if (typeof attrs === 'string') { try { attrs = JSON.parse(attrs); } catch { attrs = {}; } }
          return {
            id: vr.id,
            weight: attrs?.weight || variationLabel(vr),
            price: vr.price ?? '',
            comparePrice: vr.comparePrice ?? '',
            wholesalePrice: vr.wholesalePrice ?? '',
            stock: vr.stock ?? '',
            sku: vr.sku || '',
          };
        }),
      })}
      toPayload={(v) => ({
        name: v.name,
        description: v.description,
        categoryId: v.categoryId,
        status: v.status || 'active',
        images: v.images instanceof File ? v.images : undefined,
        variations: (Array.isArray(v.variations) ? v.variations : [])
          .filter((r) => r && r.price !== '' && r.price != null)
          .map((r) => ({
            sku: r.sku || undefined,
            price: Number(r.price) || 0,
            comparePrice: r.comparePrice !== '' && r.comparePrice != null ? Number(r.comparePrice) : null,
            wholesalePrice: r.wholesalePrice !== '' && r.wholesalePrice != null ? Number(r.wholesalePrice) : null,
            stock: Number(r.stock) || 0,
            attributes: { weight: r.weight || 'Default' },
          })),
      })}
    />
  );
}
