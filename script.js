// by encodedmabel


const {
    EventBus,
    Events,
    Plugin,
    createApp,
    DragEventPlugin,
    DragEvent
  } = Veloxi

const OFFSET = 10

class SetActiveIndexEvent {
  index
  constructor({ index }) {
    this.index = index
  }
}

class NavItem {
  view
  index
  container
  initialized = false

  constructor(view, index, container) {
    this.view = view
    this.index = index
    this.container = container
    this.view.position.animator.set('dynamic', { speed: 5 })
    this.view.scale.animator.set('dynamic', { speed: 5 })
  }

  init() {
    requestAnimationFrame(() => {
      this.enableTransition()
    })
    this.initialized = true
  }

  enableTransition() {
    this.view.styles.transition = '0.2s opacity linear'
  }

  update() {
    this.updatePosition()
    this.updateOpacity()
    this.updateScale()
  }

  updateWithOffset(offset) {
    const targetSlot = offset > 0 ? this.nextSlot : this.previousSlot
    const percentage = Math.abs(offset / this.container.stepSize)
    this.updatePositionWithOffset(offset, targetSlot, percentage)
    this.updateOpacityWithPercentage(targetSlot, percentage)
    this.updateScaleWithPercentage(targetSlot, percentage)
  }

  updatePositionWithOffset(offset, targetSlot, percentage) {
    const x = this.currentPosition.x
    let y = this.currentPosition.y
    switch (targetSlot) {
      case slotIndex.ACTIVE:
        y -= 10 * percentage
        break
      case slotIndex.FIRST_NEXT:
      case slotIndex.FIRST_PREVIOUS:
        const fromActive = this.slotIndex === slotIndex.ACTIVE
        y += 25 * (fromActive ? 1 : -1) * percentage
        break
      case slotIndex.SECOND_NEXT:
      case slotIndex.SECOND_PREVIOUS:
        const fromFirst = [
          slotIndex.FIRST_NEXT,
          slotIndex.FIRST_PREVIOUS
        ].includes(this.slotIndex)
        y += 40 * percentage * (fromFirst ? 1 : -1)
        break
      default:
        const fromSecond = [
          slotIndex.SECOND_NEXT,
          slotIndex.SECOND_PREVIOUS
        ].includes(this.slotIndex)
        y += 40 * percentage * (fromSecond ? 1 : -1)
    }
    this.view.position.set({ x: x + offset, y })
  }

  updateScaleWithPercentage(targetSlot, percentage) {
    let scale = this.currentScale

    switch (targetSlot) {
      case slotIndex.ACTIVE:
        scale += 0.1 * percentage
        break
      case slotIndex.FIRST_NEXT:
      case slotIndex.FIRST_PREVIOUS:
        const fromActive = this.slotIndex === slotIndex.ACTIVE
        if (fromActive) {
          scale -= 0.1 * percentage
        }
        break
    }
    this.view.scale.set({ x: scale, y: scale })
  }

  updateOpacityWithPercentage(targetSlot, percentage) {
    let opacity = this.currentOpacity
    switch (targetSlot) {
      case slotIndex.ACTIVE:
        opacity += 0.2 * percentage
        break
      case slotIndex.FIRST_PREVIOUS:
      case slotIndex.FIRST_NEXT:
        const fromActive = this.slotIndex === slotIndex.ACTIVE
        opacity += 0.2 * percentage * (fromActive ? -1 : 1)
        break
      case slotIndex.SECOND_PREVIOUS:
      case slotIndex.SECOND_NEXT:
        const fromFirst = [
          slotIndex.FIRST_NEXT,
          slotIndex.FIRST_PREVIOUS
        ].includes(this.slotIndex)
        if (!fromFirst) {
          if (
            this.firstItemIndexInStart === this.index ||
            this.firstItemIndexInEnd === this.index
          ) {
            opacity += 0.2 * percentage * (fromFirst ? -1 : 1)
          } else {
            opacity = 0
          }
        } else {
          opacity += 0.2 * percentage * (fromFirst ? -1 : 1)
        }
        break
      default:
        const fromSecond = [
          slotIndex.SECOND_NEXT,
          slotIndex.SECOND_PREVIOUS
        ].includes(this.slotIndex)
        if (fromSecond) {
          opacity += 0.4 * percentage * (fromSecond ? -1 : 1)
        } else {
          opacity = 0
        }
    }
    this.view.styles.opacity = `${opacity}`
  }

  updatePosition() {
    const shouldAnimate = this.container.shouldAnimateMap.get(this.index)
    const x = this.slotPosition.x
    let y = this.slotPosition.y
    switch (this.slotIndex) {
      case slotIndex.ACTIVE:
        break
      case slotIndex.FIRST_NEXT:
      case slotIndex.FIRST_PREVIOUS:
        y += 10
        break
      case slotIndex.SECOND_NEXT:
      case slotIndex.SECOND_PREVIOUS:
        y += 40
        break
      default:
        y += 100
    }
    this.view.position.set({ x, y }, shouldAnimate)
  }

  get currentPosition() {
    const x = this.slotPosition.x
    let y = this.slotPosition.y
    switch (this.slotIndex) {
      case slotIndex.ACTIVE:
        break
      case slotIndex.FIRST_NEXT:
      case slotIndex.FIRST_PREVIOUS:
        y += 10
        break
      case slotIndex.SECOND_NEXT:
      case slotIndex.SECOND_PREVIOUS:
        y += 40
        break
      default:
        y += 80
    }
    return { x, y }
  }

  get currentOpacity() {
    let opacity = 0
    switch (this.slotIndex) {
      case slotIndex.ACTIVE:
        opacity = 1
        break
      case slotIndex.FIRST_PREVIOUS:
      case slotIndex.FIRST_NEXT:
        opacity = 0.425
        break
      case slotIndex.SECOND_PREVIOUS:
      case slotIndex.SECOND_NEXT:
        opacity = 0.2
        break
    }
    return opacity
  }

  get currentScale() {
    let scale = 0.75
    switch (this.slotIndex) {
      case slotIndex.ACTIVE:
        scale = 1
        break
      case slotIndex.FIRST_PREVIOUS:
      case slotIndex.FIRST_NEXT:
        scale = 0.75
        break
      case slotIndex.SECOND_PREVIOUS:
      case slotIndex.SECOND_NEXT:
        scale = 0.75
        break
    }
    return scale
  }

  updateOpacity() {
    let opacity = 0
    switch (this.slotIndex) {
      case slotIndex.ACTIVE:
        opacity = 1
        break
      case slotIndex.FIRST_PREVIOUS:
      case slotIndex.FIRST_NEXT:
        opacity = 0.425
        break
      case slotIndex.SECOND_PREVIOUS:
      case slotIndex.SECOND_NEXT:
        opacity = 0.2
        break
    }

    this.view.styles.opacity = `${opacity}`
  }

  updateScale() {
    let scale = 0.75
    switch (this.slotIndex) {
      case slotIndex.ACTIVE:
        scale = 1
        break
      case slotIndex.FIRST_PREVIOUS:
      case slotIndex.FIRST_NEXT:
        scale = 0.75
        break
      case slotIndex.SECOND_PREVIOUS:
      case slotIndex.SECOND_NEXT:
        scale = 0.75
        break
    }
    this.view.scale.set({ x: scale, y: scale }, this.initialized)
  }

  get nextSlot() {
    return wrapAround(this.slotIndex, Object.keys(slotIndex).length, 1)
  }

  get previousSlot() {
    return wrapAround(this.slotIndex, Object.keys(slotIndex).length, -1)
  }

  get slotPosition() {
    return this.container.getSlotPositionForItemIndex(this.index)
  }

  get activeIndex() {
    return this.container.activeIndex
  }

  get slotIndex() {
    return this.container.getSlotForIndex(this.index)
  }

  getItemIndexForSlot(slot) {
    return this.container.getItemIndeciesForSlot(slot)[0]
  }

  get firstItemIndexInStart() {
    const secondPreviousIndex = this.getItemIndexForSlot(
      slotIndex.SECOND_PREVIOUS
    )
    return wrapAround(secondPreviousIndex, this.container.totalItems, -1)
  }

  get firstItemIndexInEnd() {
    const secondNextItemIndex = this.getItemIndexForSlot(
      slotIndex.SECOND_NEXT
    )
    return wrapAround(secondNextItemIndex, this.container.totalItems, 1)
  }
}

const slotIndex = {
  START: 0,
  SECOND_PREVIOUS: 1,
  FIRST_PREVIOUS: 2,
  ACTIVE: 3,
  FIRST_NEXT: 4,
  SECOND_NEXT: 5,
  END: 6
}

function wrapAround(current, total, amount) {
  return (current + total + amount) % total
}

function flipMap(map) {
  const flippedMap = new Map()

  for (const [key, value] of map) {
    if (!flippedMap.has(value)) {
      flippedMap.set(value, [key])
    } else {
      flippedMap.get(value).push(key)
    }
  }

  return flippedMap
}

class NavContainer {
  plugin
  view
  activeIndex
  shouldAnimateMap = new Map()

  _itemIndexSlotMap = new Map()
  _slotItemIndexMap = new Map()

  constructor(plugin, view) {
    this.plugin = plugin
    this.view = view
    this.activeIndex = this.view.data.activeIndex
      ? parseInt(this.view.data.activeIndex)
      : 0

    for (let index = 0; index < this.totalItems; index++) {
      this.shouldAnimateMap.set(index, false)
    }
  }

  get stepSize() {
    return this.plugin.stepSize
  }

  get itemSize() {
    return this.plugin.itemSize
  }

  get totalItems() {
    return this.plugin.totalItems
  }

  updateWithOffset(offset) {
    const steps = Math.floor(Math.abs(offset / this.stepSize))
    const queue = []
    let currentIndex = this.activeIndex
    for (let step = 0; step < steps; step++) {
      const stepDirection = offset < 0 ? 1 : -1
      const itemIndex = wrapAround(
        currentIndex,
        this.totalItems,
        stepDirection
      )
      queue.push(itemIndex)
      currentIndex = itemIndex
    }
    queue.forEach((itemIndex, index) => {
      setTimeout(() => {
        this.plugin.setActiveIndex(itemIndex)
      }, 100 * index)
    })
  }

  setActiveIndex(newActiveIndex) {
    const previousItemIndexSlot = this.itemIndexSlotMap
    this.activeIndex = newActiveIndex
    this.setItemIndexSlotMap()
    const newItemIndexSlot = this.itemIndexSlotMap

    const visibleSlots = [
      slotIndex.ACTIVE,
      slotIndex.FIRST_PREVIOUS,
      slotIndex.SECOND_PREVIOUS,
      slotIndex.FIRST_NEXT,
      slotIndex.SECOND_NEXT
    ]
    for (let index = 0; index < this.totalItems; index++) {
      const shouldAnimate =
        visibleSlots.includes(previousItemIndexSlot.get(index)) ||
        visibleSlots.includes(newItemIndexSlot.get(index))
      this.shouldAnimateMap.set(index, shouldAnimate)
    }
  }

  get slotItemIndexMap() {
    return this._slotItemIndexMap
  }

  get itemIndexSlotMap() {
    return this._itemIndexSlotMap
  }

  getSlotForIndex(itemIndex) {
    return this.itemIndexSlotMap.get(itemIndex)
  }

  getItemIndeciesForSlot(slot) {
    return this.slotItemIndexMap.get(slot)
  }

  setItemIndexSlotMap() {
    this._itemIndexSlotMap.clear()
    const activeIndex = this.activeIndex

    const firstPreviousIndex = wrapAround(activeIndex, this.totalItems, -1)
    const secondPreviousIndex = wrapAround(activeIndex, this.totalItems, -2)
    const firstNextIndex = wrapAround(activeIndex, this.totalItems, 1)
    const secondNextIndex = wrapAround(activeIndex, this.totalItems, 2)

    for (let index = 0; index < this.totalItems; index++) {
      if (index === activeIndex) {
        this._itemIndexSlotMap.set(index, slotIndex.ACTIVE)
        continue
      }

      if (index === firstPreviousIndex) {
        this._itemIndexSlotMap.set(index, slotIndex.FIRST_PREVIOUS)
        continue
      }

      if (index === secondPreviousIndex) {
        this._itemIndexSlotMap.set(index, slotIndex.SECOND_PREVIOUS)
        continue
      }

      if (index === firstNextIndex) {
        this._itemIndexSlotMap.set(index, slotIndex.FIRST_NEXT)
        continue
      }

      if (index === secondNextIndex) {
        this._itemIndexSlotMap.set(index, slotIndex.SECOND_NEXT)
        continue
      }

      if (index === wrapAround(secondNextIndex, this.totalItems, 1)) {
        this._itemIndexSlotMap.set(index, slotIndex.END)
        continue
      }

      if (index === wrapAround(secondNextIndex, this.totalItems, 2)) {
        this._itemIndexSlotMap.set(index, slotIndex.END)
        continue
      }

      if (index === wrapAround(secondPreviousIndex, this.totalItems, -1)) {
        this._itemIndexSlotMap.set(index, slotIndex.START)
        continue
      }

      if (index === wrapAround(secondPreviousIndex, this.totalItems, -2)) {
        this._itemIndexSlotMap.set(index, slotIndex.START)
        continue
      }

      if (index > activeIndex) {
        this._itemIndexSlotMap.set(index, slotIndex.END)
        continue
      }

      if (index < activeIndex) {
        this._itemIndexSlotMap.set(index, slotIndex.START)
        continue
      }
    }
    this._slotItemIndexMap = flipMap(this.itemIndexSlotMap)
  }

  getSlotPositionForItemIndex(index) {
    const slot = this.itemIndexSlotMap.get(index)
    return this.slotPositions[slot]
  }

  get indicatorPosition() {
    return {
      x: this.view.position.x + this.view.size.width / 2,
      y: this.view.position.y + this.view.size.height / 2
    }
  }

  get slotPositions() {
    const result = []
    // Active Slot
    result[slotIndex.ACTIVE] = {
      x: this.indicatorPosition.x - this.itemSize / 2,
      y: this.indicatorPosition.y - this.itemSize / 2
    }

    result[slotIndex.FIRST_PREVIOUS] = {
      x: result[slotIndex.ACTIVE].x - OFFSET - this.itemSize,
      y: result[slotIndex.ACTIVE].y
    }

    result[slotIndex.SECOND_PREVIOUS] = {
      x: result[slotIndex.FIRST_PREVIOUS].x - this.itemSize,
      y: result[slotIndex.FIRST_PREVIOUS].y
    }

    result[slotIndex.START] = {
      x: result[slotIndex.SECOND_PREVIOUS].x - this.itemSize,
      y: result[slotIndex.SECOND_PREVIOUS].y
    }

    result[slotIndex.FIRST_NEXT] = {
      x: result[slotIndex.ACTIVE].x + OFFSET + this.itemSize,
      y: result[slotIndex.ACTIVE].y
    }

    result[slotIndex.SECOND_NEXT] = {
      x: result[slotIndex.FIRST_NEXT].x + this.itemSize,
      y: result[slotIndex.FIRST_NEXT].y
    }

    result[slotIndex.END] = {
      x: result[slotIndex.SECOND_NEXT].x + this.itemSize,
      y: result[slotIndex.SECOND_NEXT].y
    }

    return result
  }
}

class ContentItem {
  view
  index
  navItemsContainer

  constructor(view, index, navItemsContainer) {
    this.view = view
    this.index = index
    this.navItemsContainer = navItemsContainer
    this.init()
    this.update()
  }

  init() {
    requestAnimationFrame(() => {
      this.enableTransition()
    })
  }

  enableTransition() {
    this.view.styles.transition = '0.2s ease-in-out opacity'
  }

  update() {
    if (this.index !== this.activeIndex) {
      this.hide()
    } else {
      this.show()
    }
  }

  hide() {
    this.view.styles.opacity = '0'
  }

  show() {
    this.view.styles.opacity = '1'
  }

  get activeIndex() {
    return this.navItemsContainer.activeIndex
  }
}

class CurvedNavPlugin extends Plugin {
  static pluginName = 'CurvedNavPlugin'

  items
  itemsContainer

  contentItems

  lastDragOffset = 0
  isDragging = false

  dragEventPlugin = this.useEventPlugin(DragEventPlugin)

  setup() {
    const itemViews = this.getViews('item')
    const itemsContainerView = this.getView('itemsContainer')
    this.itemsContainer = new NavContainer(this, itemsContainerView)

    this.dragEventPlugin.addView(itemsContainerView)
    this.dragEventPlugin.on(DragEvent, this.onDrag.bind(this))

    this.items = itemViews.map(
      (view, index) => new NavItem(view, index, this.itemsContainer)
    )

    this.itemsContainer.setItemIndexSlotMap()

    this.items.forEach((item) => {
      item.update()
      item.init()
    })

    this.contentItems = this.getViews('contentItem').map(
      (view, index) => new ContentItem(view, index, this.itemsContainer)
    )
  }

  onDrag(event) {
    if (event.isDragging) {
      this.isDragging = true
    } else {
      requestAnimationFrame(() => {
        this.isDragging = false
      })
    }
    if (event.isDragging) {
      const diff = Math.abs(event.previousX - event.x)
      const damping = diff > 50 ? 0.2 : 1
      const offset = damping * (event.width + this.lastDragOffset * -1)
      if (Math.abs(offset) >= this.stepSize) {
        this.lastDragOffset = event.width
      }
      this.itemsContainer.updateWithOffset(offset)
      this.items.forEach((item) => {
        item.updateWithOffset(offset)
      })
    } else {
      this.lastDragOffset = 0
      this.items.forEach((item) => {
        item.updateWithOffset(0)
      })
    }
  }

  onDataChanged(data) {
    if (data.dataName === 'activeIndex') {
      const activeIndex = parseInt(data.dataValue)
      this.itemsContainer.setActiveIndex(activeIndex)
      this.items.forEach((item) => item.update())
      this.contentItems.forEach((item) => item.update())
    }
  }

  subscribeToEvents(eventBus) {
    eventBus.subscribeToEvent(Events.PointerClickEvent, ({ target }) => {
      if (this.isDragging) return
      this.items.forEach((item, index) => {
        if (target === item.view.element) {
          this.setActiveIndex(index)
        }
      })
    })
  }

  setActiveIndex(index) {
    this.emit(SetActiveIndexEvent, { index })
  }

  get totalItems() {
    return this.getViews('item').length
  }

  get itemSize() {
    return this.items[0].view.size.width
  }

  get stepSize() {
    return this.itemSize + OFFSET
  }
}

const app = createApp()
app.addPlugin(CurvedNavPlugin)
app.run()

const containerNav = document.querySelector(
  '[data-vel-view="itemsContainer"]'
)
app.onPluginEvent(CurvedNavPlugin, SetActiveIndexEvent, ({ index }) => {
  containerNav.dataset.velDataActiveIndex = `${index}`
})

