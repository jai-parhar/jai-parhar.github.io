

const post_list = document.getElementById("post-list");
const reversed_POSTS = POSTS.slice().reverse();

reversed_POSTS.forEach((post, index) => {
    const post_button = document.createElement("button");
    post_button.classList.add("blog-link");
    post_button.textContent = post.title;
     post_button.onclick = () => {
        loadPost(post);
        document.querySelectorAll(".blog-link").forEach(btn => btn.classList.remove("selected"));
        post_button.classList.add("selected");
    };
    post_list.appendChild(post_button);
    if (index === 0) {
        loadPost(post);
        post_button.classList.add("selected");
    }
});

async function loadPost(post) {
    const response = await fetch(post.file);
    const post_html = await response.text();
    document.getElementById("post-viewer").innerHTML = post_html;
}