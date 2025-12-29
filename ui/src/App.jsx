import { useState } from 'react'
import './App.css'

function App() {
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
    
    alert(`주문이 완료되었습니다!\n총 금액: ${totalAmount.toLocaleString()}원`)
    setCart([])
    setSelectedOptions({})
  }

  // 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString() + '원'
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="logo">COZY</div>
        <div className="nav-buttons">
          <button className="nav-btn active">주문하기</button>
          <button className="nav-btn">관리자</button>
        </div>
      </header>

      {/* 메뉴 아이템 영역 */}
      <main className="menu-section">
        <div className="menu-grid">
          {menus.map(menu => (
            <div key={menu.id} className="menu-card">
              <div className="menu-image">
                <img src={menu.image} alt={menu.name} />
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
    </div>
  )
}

export default App
