const isMobile =
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

if (isMobile) {
    window.location.href = "/backroom/NOPHONES.html";
}