'use client';

import { useEffect, useState } from 'react';
import { mediaUrl } from '@/lib/api';
import { firstImage, productPricing, formatPrice } from '@/lib/format';
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
        { key: 'price', label: 'Price', render: (p) => formatPrice(productPricing(p).price) },
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
        { name: 'sku', label: 'SKU' },
        { name: 'price', label: 'Price', type: 'number', required: true },
        { name: 'comparePrice', label: 'Compare-at price', type: 'number' },
        { name: 'stock', label: 'Stock', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'images', label: 'Image', type: 'image', colSpan: 2 },
      ]}
      toFormValues={(p) => {
        const v = (p.ProductVariations || p.variations || [])[0] || {};
        return {
          name: p.name, categoryId: String(p.categoryId || p.category?.id || ''), status: p.status || 'active',
          sku: v.sku || '', price: v.price || '', comparePrice: v.comparePrice || '', stock: v.stock ?? '',
          description: p.description || '', images: firstImage(p),
        };
      }}
      toPayload={(v) => ({
        name: v.name,
        description: v.description,
        categoryId: v.categoryId,
        status: v.status || 'active',
        images: v.images instanceof File ? v.images : undefined,
        variations: [
          {
            sku: v.sku || `SKU-${v.name?.slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
            price: Number(v.price) || 0,
            comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
            stock: Number(v.stock) || 0,
            attributes: { title: 'Default' },
          },
        ],
      })}
    />
  );
}
