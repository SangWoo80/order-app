import { useState, useMemo, useEffect } from 'react'
import './App.css'
import { menuAPI, orderAPI } from './api/api.js'

function App() {
  // 현재 화면 상태
  const [currentScreen, setCurrentScreen] = useState('order') // 'order' or 'admin'

  // 메뉴 데이터
  const [menus, setMenus] = useState([])
  const [menusLoading, setMenusLoading] = useState(true)

  // 메뉴 데이터 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setMenusLoading(true)
        const menuData = await menuAPI.getMenus()
        // API 응답을 프런트엔드 형식으로 변환
        const formattedMenus = menuData.map(menu => ({
          id: menu.id,
          name: menu.name,
          price: menu.price,
          description: menu.description || '',
          image: menu.image_url || '',
          options: menu.options.map(opt => ({
            id: opt.id,
            name: opt.name,
            price: opt.price
          }))
        }))
        setMenus(formattedMenus)
      } catch (error) {
        console.error('메뉴 로드 오류:', error)
        alert(`메뉴를 불러오는 중 오류가 발생했습니다.\n${error.message || '알 수 없는 오류'}`)
      } finally {
        setMenusLoading(false)
      }
    }
    loadMenus()
  }, [])


  // 주문 데이터 (주문하기 화면에서 생성, 관리자 화면에서 표시)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // 재고 데이터
  const [inventory, setInventory] = useState([])
  const [inventoryLoading, setInventoryLoading] = useState(false)

  // 주문 목록 로드
  const loadOrders = async () => {
    try {
      setOrdersLoading(true)
      const orderData = await orderAPI.getOrders()
      // API 응답을 프런트엔드 형식으로 변환
      const formattedOrders = orderData.map(order => ({
        id: order.id,
        orderTime: new Date(order.order_time),
        status: order.status,
        items: order.items.map(item => ({
          menuId: item.menu_id,
          menuName: item.menu_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          options: item.options || [],
          optionNames: item.options && item.options.length > 0 
            ? ` (${item.options.map(opt => opt.option_name).join(', ')})` 
            : ''
        })),
        totalAmount: order.total_amount
      }))
      setOrders(formattedOrders)
    } catch (error) {
      console.error('주문 목록 로드 오류:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  // 재고 목록 로드
  const loadInventory = async () => {
    try {
      setInventoryLoading(true)
      const inventoryData = await menuAPI.getInventory()
      setInventory(inventoryData)
    } catch (error) {
      console.error('재고 목록 로드 오류:', error)
    } finally {
      setInventoryLoading(false)
    }
  }

  // 관리자 화면 진입 시 데이터 로드
  useEffect(() => {
    if (currentScreen === 'admin') {
      loadOrders()
      loadInventory()
    }
  }, [currentScreen])

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
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    
    try {
      // API 요청 형식으로 변환
      const orderData = {
        items: cart.map(item => {
          const menu = menus.find(m => m.id === item.menuId)
          const selectedOptions = menu?.options
            .filter(opt => item.options.includes(opt.name))
            .map(opt => ({
              option_id: opt.id || 0,
              option_name: opt.name,
              option_price: opt.price
            })) || []
          
          return {
            menu_id: item.menuId,
            menu_name: item.menuName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_price: item.totalPrice,
            options: selectedOptions
          }
        }),
        total_amount: totalAmount
      }

      const result = await orderAPI.createOrder(orderData)
      
      alert(`주문이 완료되었습니다!\n총 금액: ${totalAmount.toLocaleString()}원`)
      setCart([])
      setSelectedOptions({})
      
      // 관리자 화면이면 주문 목록 새로고침
      if (currentScreen === 'admin') {
        loadOrders()
      }
    } catch (error) {
      console.error('주문 생성 오류:', error)
      alert(`주문 생성 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  // 재고 증가
  const increaseStock = async (menuId) => {
    try {
      const result = await menuAPI.updateInventory(menuId, 1)
      // 재고 목록 새로고침
      await loadInventory()
    } catch (error) {
      console.error('재고 증가 오류:', error)
      alert(`재고 수정 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  // 재고 감소
  const decreaseStock = async (menuId) => {
    try {
      const result = await menuAPI.updateInventory(menuId, -1)
      // 재고 목록 새로고침
      await loadInventory()
    } catch (error) {
      console.error('재고 감소 오류:', error)
      alert(`재고 수정 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  // 재고 상태 확인
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#ff4444' }
    if (stock < 5) return { text: '주의', color: '#ff8800' }
    return { text: '정상', color: '#00aa00' }
  }

  // 주문 상태 변경
  const changeOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      // 주문 목록과 재고 목록 새로고침
      await loadOrders()
      await loadInventory()
    } catch (error) {
      console.error('주문 상태 변경 오류:', error)
      alert(`주문 상태 변경 중 오류가 발생했습니다: ${error.message}`)
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
        {menusLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>메뉴를 불러오는 중...</p>
          </div>
        ) : (
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
        )}
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
        {inventoryLoading ? (
          <p style={{ textAlign: 'center', padding: '1rem' }}>재고를 불러오는 중...</p>
        ) : (
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
        )}
      </div>

      {/* 주문 현황 */}
      <div className="order-status-section">
        <h2 className="section-title">주문 현황</h2>
        {ordersLoading ? (
          <p style={{ textAlign: 'center', padding: '1rem' }}>주문을 불러오는 중...</p>
        ) : orders.length === 0 ? (
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
