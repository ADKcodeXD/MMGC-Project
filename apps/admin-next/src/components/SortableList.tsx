import { HolderOutlined } from '@ant-design/icons'
import { Empty } from 'antd'
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
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type SortableListProps<T> = {
  items: T[]
  getKey: (item: T) => string | number
  render: (item: T, index: number) => React.ReactNode
  onSort: (items: T[]) => void
}

function SortableItem({ id, children }: { id: string | number, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div className="sortable-item" ref={setNodeRef} style={style}>
      <HolderOutlined className="drag-handle" {...attributes} {...listeners} />
      {children}
    </div>
  )
}

export default function SortableList<T>({ items, getKey, render, onSort }: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!items.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => getKey(item) === active.id)
      const newIndex = items.findIndex((item) => getKey(item) === over.id)
      const newArray = arrayMove(items, oldIndex, newIndex)
      onSort(newArray)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(item => getKey(item))} strategy={verticalListSortingStrategy}>
        <div className="sortable-list">
          {items.map((item, index) => (
            <SortableItem key={getKey(item)} id={getKey(item)}>
              {render(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
