function addProduct(payload) {
    // tạo hàm addProduct nhận tham số là payload
    return {
        type: 'ADD_PRODUCT', // tạo type la 'ADD_PRODUCT' là action thêm sp mới
        payload, // là dữ liệu bổ sung cho action, chứa thông tin của sp cần đc thêm vào giỏ hàng
    };
}

function removeProduct(payload) {
    console.log(payload);
    return {
        type: 'REMOVE_PRODUCT',
        payload,
    };
}

export { addProduct, removeProduct };
