const initState = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];
// khởi tạo giá trị ban đầu từ local storage. lấy giá trị của product từ local Storage? chuyển đổi chuỗi Json lấy từ LocalStorage thành JVScrip.
// Nếu localStorage không có key product thì init State sẽ là 1 mảng rỗng
function reducerUser(state = initState, action) {
    // Gán state ban đầu là initState, action là hành động gửi đến reducer
    switch (
        action.type // Khi thay đổi action.type thì thay đổi state
    ) {
        case 'ADD_PRODUCT':
            const existingProductIndex = state.findIndex(
                (product) =>
                    product.id === action.payload.id &&
                    (product.selectedSize  || '') === (action.payload.selectedSize  || '') &&
                    (product.selectedColor || '') === (action.payload.selectedColor || '')
            );
            if (existingProductIndex === -1) {
                const updatedState = [...state, action.payload];
                localStorage.setItem('products', JSON.stringify(updatedState));
                return updatedState;
            } else {
                // Cùng sản phẩm + cùng size/color → không thêm trùng
                return state;
            }
        case 'REMOVE_PRODUCT': // xử lý action 'REMOVE_PRODUCT'
            const updatedState = []; // lọc với updatedState
            localStorage.setItem('products', JSON.stringify(updatedState)); // cập nhật localStorage với updatedState
            return updatedState; //trả về updatedState
        default: // khi thay đổi action.type thì thay đổi state
            return state; // trả về state
    }
}

export default reducerUser;
