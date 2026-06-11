import React, { useState } from 'react'
import { Form, Modal, Button, Row, Col, Input, Select, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FormInstance } from 'antd'
import { bilibiliApi } from '../api/modules'
import type { StaffItem } from '../types'

interface StaffListProps {
  form: FormInstance
}

const roleMap: Record<string, { label: string; color: string }> = {
  organizer: { label: '主办人', color: 'error' },
  judge: { label: '评委', color: 'processing' },
  translator: { label: '翻译', color: 'success' },
  others: { label: '贡献者', color: 'default' }
}

function extractBiliUid(url: string): number | null {
  const m1 = url.match(/space\.bilibili\.com\/(\d+)/)
  if (m1) return Number(m1[1])
  const m2 = url.match(/bilibili\.com\/space\/(\d+)/)
  if (m2) return Number(m2[1])
  return null
}

function SortableItem(props: { id: string; index: number; staff: StaffItem; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id })
  const style = { transform: CSS.Transform.toString(transform), transition, cursor: 'pointer' }

  return (
    <div ref={setNodeRef} style={{ ...style, position: 'relative' }} {...attributes} {...listeners} onClick={props.onClick}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', border: '1px solid #d9d9d9', marginBottom: '8px' }}>
          {props.staff.avatar ? (
            <img src={props.staff.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={props.staff.name} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>图</div>
          )}
        </div>
        <div style={{ fontSize: '12px', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
          {props.staff.name || '未命名'}
        </div>
        <Tag color={roleMap[props.staff.role]?.color || 'default'} style={{ margin: 0, fontSize: '10px', lineHeight: '16px' }}>
          {roleMap[props.staff.role]?.label || '未知'}
        </Tag>
      </div>
    </div>
  )
}

export default function StaffList({ form }: StaffListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  
  const [modalForm] = Form.useForm()
  const [loadingBili, setLoadingBili] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Watch the staff array from the main form
  const staffArray: StaffItem[] = Form.useWatch('staff', form) || []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = staffArray.findIndex((_, i) => `staff-${i}` === active.id)
      const newIndex = staffArray.findIndex((_, i) => `staff-${i}` === over.id)
      const newArray = arrayMove(staffArray, oldIndex, newIndex)
      form.setFieldsValue({ staff: newArray })
    }
  }

  const openModal = (index: number | null) => {
    setEditingIndex(index)
    setErrorMsg('')
    if (index !== null) {
      modalForm.setFieldsValue(staffArray[index])
    } else {
      modalForm.resetFields()
    }
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await modalForm.validateFields()
      const newArray = [...staffArray]
      if (editingIndex !== null) {
        newArray[editingIndex] = values
      } else {
        newArray.push(values)
      }
      form.setFieldsValue({ staff: newArray })
      setModalOpen(false)
    } catch (e) {
      // Validate failed
    }
  }

  const handleDelete = () => {
    if (editingIndex !== null) {
      const newArray = [...staffArray]
      newArray.splice(editingIndex, 1)
      form.setFieldsValue({ staff: newArray })
      setModalOpen(false)
    }
  }

  const handleLinkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val) return
    const uid = extractBiliUid(val)
    if (!uid) return

    setLoadingBili(true)
    setErrorMsg('')
    try {
      const res = await bilibiliApi.userInfo(uid)
      if (res) {
        modalForm.setFieldsValue({ name: res.name, avatar: res.face })
      } else {
        setErrorMsg('获取 B 站信息失败')
      }
    } catch (e: any) {
      setErrorMsg(e.message || '获取 B 站信息失败')
    } finally {
      setLoadingBili(false)
    }
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={staffArray.map((_, i) => `staff-${i}`)} strategy={rectSortingStrategy}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {staffArray.map((item, i) => (
              <SortableItem key={`staff-${i}`} id={`staff-${i}`} index={i} staff={item} onClick={() => openModal(i)} />
            ))}
            <div
              style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => openModal(null)}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px dashed #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', background: '#fafafa' }}>
                <PlusOutlined style={{ color: '#999', fontSize: '20px' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>新增 Staff</div>
            </div>
          </div>
        </SortableContext>
      </DndContext>

      <Modal
        title={editingIndex !== null ? '编辑 Staff' : '新增 Staff'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        footer={[
          editingIndex !== null && (
            <Button key="delete" danger onClick={handleDelete} style={{ float: 'left' }}>
              删除
            </Button>
          ),
          <Button key="cancel" onClick={() => setModalOpen(false)}>取消</Button>,
          <Button key="submit" type="primary" onClick={handleSave}>确定</Button>
        ]}
      >
        <Form form={modalForm} layout="vertical" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="人员名字" rules={[{ required: true }]}>
                <Input placeholder="输入名字" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="担任角色" rules={[{ required: true }]}>
                <Select placeholder="选择角色">
                  <Select.Option value="organizer">主办人</Select.Option>
                  <Select.Option value="judge">评委</Select.Option>
                  <Select.Option value="translator">翻译</Select.Option>
                  <Select.Option value="others">贡献者</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="头像" required>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.avatar !== curr.avatar}
                  >
                    {() => {
                      const currentAvatar = modalForm.getFieldValue('avatar')
                      return (
                        <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', border: '1px solid #d9d9d9', flexShrink: 0 }}>
                          {currentAvatar ? (
                            <img src={currentAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>图</div>
                          )}
                        </div>
                      )
                    }}
                  </Form.Item>
                  <Form.Item name="avatar" style={{ margin: 0, flex: 1 }}>
                    <Input placeholder="输入图片 URL 或者通过下方 B站 链接自动抓取" />
                  </Form.Item>
                </div>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="link" label="个人主页 (B站链接自动抓取)">
                <Input placeholder="https://space.bilibili.com/..." onChange={handleLinkChange} />
              </Form.Item>
              {loadingBili && <div style={{ fontSize: 12, color: '#1677ff', marginTop: -16, marginBottom: 16 }}>正在抓取 B站 信息...</div>}
              {errorMsg && <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: -16, marginBottom: 16 }}>{errorMsg}</div>}
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
