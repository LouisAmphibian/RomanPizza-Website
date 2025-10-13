// Example script for arrow navigation (you can expand this later)
document.querySelectorAll('.arrow').forEach(arrow => {
  arrow.addEventListener('click', () => {
    alert('Promo navigation clicked!');
  });
});

// Navigate to menu page
document.querySelectorAll('.order-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = "menu.html";
  });
});
