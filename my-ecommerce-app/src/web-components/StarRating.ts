// Kế thừa class chuẩn của trình duyệt
export class StarRating extends HTMLElement {
  connectedCallback() {
    // Lấy số sao từ thuộc tính HTML
    const rating = parseFloat(this.getAttribute('rating') || '0');
    const fullStars = Math.floor(rating);
    
    // Vẽ giao diện (Vanilla JS thuần túy, không dùng React ở đây)
    let html = `<div style="color: #f59e0b; font-size: 1.25rem;">`;
    for (let i = 0; i < fullStars; i++) {
      html += `★`;
    }
    for (let i = 0; i < 5 - fullStars; i++) {
      html += `☆`;
    }
    html += `</div>`;
    
    this.innerHTML = html;
  }
}

// Đăng ký thẻ HTML mới với trình duyệt
if (!customElements.get('star-rating')) {
  customElements.define('star-rating', StarRating);
}