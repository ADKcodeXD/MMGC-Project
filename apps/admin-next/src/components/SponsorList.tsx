import React, { useState } from 'react'
import { Form, Modal, Select, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import type { SponsorVo } from '../types'
import { useQuery } from '@tanstack/react-query'
import { sponsorApi } from '../api/modules'
import { text } from '../utils/i18n'

interface SponsorListProps {
  form: FormInstance
}

export default function SponsorList({ form }: SponsorListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  
  const sponsorsQuery = useQuery({
    queryKey: ['sponsors-all'],
    queryFn: () => sponsorApi.list({ page: 1, pageSize: 100 })
  })

  const allSponsors = sponsorsQuery.data?.result || []
  
  // Watch the sponsorId array from the main form
  const selectedIds: number[] = Form.useWatch('sponsorId', form) || []

  const handleAdd = (value: number[]) => {
    form.setFieldsValue({ sponsorId: value })
  }

  const handleRemove = (id: number) => {
    form.setFieldsValue({ sponsorId: selectedIds.filter(v => v !== id) })
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {selectedIds.map(id => {
          const s = allSponsors.find(x => x.sponsorId === id)
          if (!s) return null
          return (
            <div key={id} style={{ position: 'relative' }}>
              <div 
                style={{ position: 'absolute', top: -8, right: -8, cursor: 'pointer', zIndex: 10, background: '#fff', borderRadius: '50%' }}
                onClick={() => handleRemove(id)}
              >
                <DeleteOutlined style={{ color: '#ff4d4f' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', border: '1px solid #d9d9d9', marginBottom: '8px' }}>
                  {s.sponsorLogo ? (
                    <img src={s.sponsorLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={text(s.sponsorName)} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>图</div>
                  )}
                </div>
                <div style={{ fontSize: '12px', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                  {text(s.sponsorName) || '未命名'}
                </div>
              </div>
            </div>
          )
        })}
        <div
          style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setModalOpen(true)}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px dashed #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', background: '#fafafa' }}>
            <PlusOutlined style={{ color: '#999', fontSize: '20px' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>选择赞助商</div>
        </div>
      </div>

      <Modal
        title="选择赞助商"
        open={modalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
      >
        <div style={{ marginTop: 24 }}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="请选择赞助商"
            value={selectedIds}
            onChange={handleAdd}
            options={allSponsors.map(s => ({
              label: text(s.sponsorName),
              value: s.sponsorId
            }))}
          />
        </div>
      </Modal>
    </div>
  )
}
