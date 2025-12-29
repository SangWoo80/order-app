import { useState, useMemo, useEffect } from 'react'
import './App.css'

function App() {
  // 현재 화면 상태
  const [currentScreen, setCurrentScreen] = useState('order') // 'order' or 'admin'

  // 메뉴 데이터
  const [menus] = useState([
    {
      id: 1,
      name: '아메리카노(ICE)',
      price: 4000,
      description: '시원한 아이스 아메리카노',
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop&q=80&auto=format',
      options: [
        { name: '샷 추가', price: 500 },
        { name: '시럽 추가', price: 0 }
      ]
    },
    {
      id: 2,
      name: '아메리카노(HOT)',
      price: 4000,
      description: '따뜻한 핫 아메리카노',
      image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=300&fit=crop&q=80&auto=format',
      options: [
        { name: '샷 추가', price: 500 },
        { name: '시럽 추가', price: 0 }
      ]
    },
    {
      id: 3,
      name: '카페라떼',
      price: 5000,
      description: '부드러운 우유와 에스프레소의 조화',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&q=80&auto=format',
      options: [
        { name: '샷 추가', price: 500 },
        { name: '시럽 추가', price: 0 }
      ]
    },
    {
      id: 4,
      name: '카푸치노',
      price: 5000,
      description: '에스프레소와 스팀 밀크의 완벽한 조합',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&q=80&auto=format',
      options: [
        { name: '샷 추가', price: 500 },
        { name: '시럽 추가', price: 0 }
      ]
    },
    {
      id: 5,
      name: '바닐라라떼',
      price: 5500,
      description: '달콤한 바닐라 시럽이 들어간 라떼',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop&q=80&auto=format',
      options: [
        { name: '샷 추가', price: 500 },
        { name: '시럽 추가', price: 0 }
      ]
    },
    {
      id: 6,
      name: '카라멜마키아토',
      price: 6000,
      description: '카라멜 시럽과 에스프레소의 달콤한 만남',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&q=80&auto=format',
      options: [
        { name: '샷 추가', price: 500 },
        { name: '시럽 추가', price: 0 }
      ]
    }
  ])


  // 주문 데이터 (주문하기 화면에서 생성, 관리자 화면에서 표시)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map(order => ({
          ...order,
          orderTime: new Date(order.orderTime)
        }))
      } catch (e) {
        return []
      }
    }
    // 예시 주문 데이터
    return [
      {
        id: 1,
        orderTime: new Date('2024-07-31T13:00:00'),
        status: 'received', // 'received', 'preparing', 'completed'
        items: [
          { menuId: 1, menuName: '아메리카노(ICE)', quantity: 1, unitPrice: 4000, totalPrice: 4000, options: [] }
        ],
        totalAmount: 4000
      }
    ]
  })

  // 재고 데이터를 localStorage에서 로드
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventory')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return [
          { id: 1, name: '아메리카노 (ICE)', stock: 10 },
          { id: 2, name: '아메리카노 (HOT)', stock: 10 },
          { id: 3, name: '카페라떼', stock: 10 }
        ]
      }
    }
    return [
      { id: 1, name: '아메리카노 (ICE)', stock: 10 },
      { id: 2, name: '아메리카노 (HOT)', stock: 10 },
      { id: 3, name: '카페라떼', stock: 10 }
    ]
  })

  // 재고 데이터를 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory))
  }, [inventory])

  // 주문 데이터를 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }, [orders])

  // 장바구니 상태
  const [cart, setCart] = useState([])

  // 각 메뉴의 선택된 옵션 상태
  const [selectedOptions, setSelectedOptions] = useState({})

  // 옵션 선택/해제 핸들러
  const handleOptionChange = (menuId, optionName) => {
    setSelectedOptions(prev => {
      const menuOptions = prev[menuId] || []
      const isSelected = menuOptions.includes(optionName)
      
      return {
        ...prev,
        [menuId]: isSelected
          ? menuOptions.filter(opt => opt !== optionName)
          : [...menuOptions, optionName]
      }
    })
  }

  // 장바구니에 추가
  const addToCart = (menu) => {
    const menuOptions = selectedOptions[menu.id] || []
    const optionKey = menuOptions.sort().join(',')
    const cartItemKey = `${menu.id}-${optionKey}`

    // 옵션에 따른 추가 가격 계산
    const optionPrice = menu.options
      .filter(opt => menuOptions.includes(opt.name))
      .reduce((sum, opt) => sum + opt.price, 0)
    
    const unitPrice = menu.price + optionPrice

    // 장바구니에 이미 있는지 확인
    const existingItem = cart.find(item => item.key === cartItemKey)
    
    if (existingItem) {
      // 수량 증가
      setCart(cart.map(item =>
        item.key === cartItemKey
          ? { ...item, quantity: item.quantity + 1, totalPrice: item.unitPrice * (item.quantity + 1) }
          : item
      ))
    } else {
      // 새 아이템 추가
      const optionNames = menuOptions.length > 0 ? ` (${menuOptions.join(', ')})` : ''
      setCart([...cart, {
        key: cartItemKey,
        menuId: menu.id,
        menuName: menu.name,
        options: menuOptions,
        optionNames: optionNames,
        unitPrice: unitPrice,
        quantity: 1,
        totalPrice: unitPrice
      }])
    }
  }

  // 장바구니에서 제거
  const removeFromCart = (itemKey) => {
    setCart(cart.filter(item => item.key !== itemKey))
  }

  // 총 금액 계산
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0)

  // 주문하기
  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    
    // 새 주문 생성
    const newOrder = {
      id: Date.now(),
      orderTime: new Date(),
      status: 'received', // 주문 접수 상태
      items: cart.map(item => ({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        options: item.options,
        optionNames: item.optionNames
      })),
      totalAmount: totalAmount
    }

    setOrders([newOrder, ...orders])
    alert(`주문이 완료되었습니다!\n총 금액: ${totalAmount.toLocaleString()}원`)
    setCart([])
    setSelectedOptions({})
  }

  // 재고 증가
  const increaseStock = (menuId) => {
    setInventory(inventory.map(item =>
      item.id === menuId ? { ...item, stock: item.stock + 1 } : item
    ))
  }

  // 재고 감소
  const decreaseStock = (menuId) => {
    setInventory(inventory.map(item =>
      item.id === menuId && item.stock > 0 ? { ...item, stock: item.stock - 1 } : item
    ))
  }

  // 재고 상태 확인
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#ff4444' }
    if (stock < 5) return { text: '주의', color: '#ff8800' }
    return { text: '정상', color: '#00aa00' }
  }

  // 주문 상태 변경
  const changeOrderStatus = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    // 주문 상태 업데이트
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ))

    // 주문 접수 시 재고 차감 (모든 아이템을 한 번에 처리)
    if (newStatus === 'preparing' && order.status === 'received') {
      setInventory(prevInventory => {
        // 재고 차감 맵 생성
        const stockDeductions = {}
        order.items.forEach(item => {
          const inventoryItem = prevInventory.find(inv => inv.id === item.menuId)
          if (inventoryItem && inventoryItem.stock >= item.quantity) {
            stockDeductions[item.menuId] = (stockDeductions[item.menuId] || 0) + item.quantity
          }
        })

        // 모든 재고를 한 번에 업데이트
        return prevInventory.map(inv => {
          const deduction = stockDeductions[inv.id]
          if (deduction) {
            return { ...inv, stock: inv.stock - deduction }
          }
          return inv
        })
      })
    }
  }

  // 주문 통계 계산 (useMemo로 최적화)
  const orderStats = useMemo(() => ({
    total: orders.length,
    received: orders.filter(o => o.status === 'received').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    completed: orders.filter(o => o.status === 'completed').length
  }), [orders])

  // 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString() + '원'
  }

  // 날짜 포맷팅
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '날짜 없음'
    }
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  // 주문하기 화면
  const OrderScreen = () => (
    <>
      {/* 메뉴 아이템 영역 */}
      <main className="menu-section">
        <div className="menu-grid">
          {menus.map(menu => (
            <div key={menu.id} className="menu-card">
              <div className="menu-image">
                <img 
                  src={menu.image} 
                  alt={menu.name}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="16"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <div className="menu-info">
                <h3 className="menu-name">{menu.name}</h3>
                <p className="menu-price">{formatPrice(menu.price)}</p>
                <p className="menu-description">{menu.description}</p>
                
                <div className="menu-options">
                  {menu.options.map((option, idx) => {
                    const isSelected = (selectedOptions[menu.id] || []).includes(option.name)
                    return (
                      <label key={idx} className="option-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleOptionChange(menu.id, option.name)}
                        />
                        <span>
                          {option.name} ({option.price > 0 ? `+${formatPrice(option.price)}` : '+0원'})
                        </span>
                      </label>
                    )
                  })}
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart(menu)}
                >
                  담기
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 장바구니 영역 */}
      <div className="cart-section">
        <div className="cart-container">
          <div className="cart-left">
            <h3 className="cart-title">주문 내역</h3>
            {cart.length === 0 ? (
              <p className="cart-empty">장바구니가 비어있습니다.</p>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.key} className="cart-item">
                    <span className="cart-item-name">
                      {item.menuName}{item.optionNames} X {item.quantity}
                    </span>
                    <span className="cart-item-price">{formatPrice(item.totalPrice)}</span>
                    <button 
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.key)}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="cart-right">
            <div className="cart-total">
              <span className="total-label">총 금액</span>
              <span className="total-amount">{formatPrice(totalAmount)}</span>
            </div>
            <button 
              className="order-btn"
              onClick={handleOrder}
              disabled={cart.length === 0}
            >
              주문하기
            </button>
          </div>
        </div>
      </div>
    </>
  )

  // 관리자 화면
  const AdminScreen = () => (
    <main className="admin-section">
      {/* 관리자 대시보드 */}
      <div className="admin-dashboard">
        <h2 className="section-title">관리자 대시보드</h2>
        <div className="dashboard-stats">
          총 주문 {orderStats.total} / 주문 접수 {orderStats.received} / 제조 중 {orderStats.preparing} / 제조 완료 {orderStats.completed}
        </div>
      </div>

      {/* 재고 현황 */}
      <div className="inventory-section">
        <h2 className="section-title">재고 현황</h2>
        <div className="inventory-grid">
          {inventory.map(item => {
            const status = getStockStatus(item.stock)
            return (
              <div key={item.id} className="inventory-card">
                <h3 className="inventory-name">{item.name}</h3>
                <div className="inventory-info">
                  <span className="inventory-stock">{item.stock}개</span>
                  <span className="inventory-status" style={{ color: status.color }}>
                    {status.text}
                  </span>
                </div>
                <div className="inventory-controls">
                  <button 
                    className="stock-btn decrease"
                    onClick={() => decreaseStock(item.id)}
                    disabled={item.stock === 0}
                  >
                    -
                  </button>
                  <button 
                    className="stock-btn increase"
                    onClick={() => increaseStock(item.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 주문 현황 */}
      <div className="order-status-section">
        <h2 className="section-title">주문 현황</h2>
        {orders.length === 0 ? (
          <p className="empty-message">주문이 없습니다.</p>
        ) : (
          <div className="order-list">
            {orders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <div className="order-time">{formatDate(order.orderTime)}</div>
                  <div className="order-details">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-detail">
                        {item.menuName}{item.optionNames ? item.optionNames : ''} x {item.quantity}
                      </div>
                    ))}
                  </div>
                  <div className="order-price">{formatPrice(order.totalAmount)}</div>
                </div>
                <div className="order-actions">
                  {order.status === 'received' && (
                    <button 
                      className="status-btn preparing"
                      onClick={() => changeOrderStatus(order.id, 'preparing')}
                    >
                      제조 시작
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      className="status-btn completed"
                      onClick={() => changeOrderStatus(order.id, 'completed')}
                    >
                      제조 완료
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className="status-completed">완료</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="logo">COZY</div>
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${currentScreen === 'order' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('order')}
          >
            주문하기
          </button>
          <button 
            className={`nav-btn ${currentScreen === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('admin')}
          >
            관리자
          </button>
        </div>
      </header>

      {/* 화면 전환 */}
      {currentScreen === 'order' ? <OrderScreen /> : <AdminScreen />}
    </div>
  )
}

export default App
