// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('서버 응답이 JSON 형식이 아닙니다. 서버가 실행 중인지 확인해주세요.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `API 호출 실패 (${response.status})`);
    }

    return data;
  } catch (error) {
    // 네트워크 오류 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('API 호출 오류: 서버에 연결할 수 없습니다.', error);
      throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    
    // 이미 Error 객체인 경우 그대로 전달
    if (error instanceof Error) {
      console.error('API 호출 오류:', error);
      throw error;
    }
    
    // 기타 오류
    console.error('API 호출 오류:', error);
    throw new Error('API 호출 중 예상치 못한 오류가 발생했습니다.');
  }
}

// 메뉴 API
export const menuAPI = {
  // 메뉴 목록 조회
  getMenus: async () => {
    const response = await apiCall('/menus');
    return response.data;
  },

  // 재고 조회
  getInventory: async () => {
    const response = await apiCall('/menus/inventory');
    return response.data;
  },

  // 재고 수정
  updateInventory: async (menuId, change) => {
    const response = await apiCall(`/menus/${menuId}/inventory`, {
      method: 'PATCH',
      body: JSON.stringify({ change })
    });
    return response.data;
  }
};

// 주문 API
export const orderAPI = {
  // 주문 생성
  createOrder: async (orderData) => {
    const response = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return response.data;
  },

  // 주문 목록 조회
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    const response = await apiCall(endpoint);
    return response.data;
  },

  // 주문 상세 조회
  getOrderById: async (orderId) => {
    const response = await apiCall(`/orders/${orderId}`);
    return response.data;
  },

  // 주문 상태 변경
  updateOrderStatus: async (orderId, status) => {
    const response = await apiCall(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return response.data;
  }
};

