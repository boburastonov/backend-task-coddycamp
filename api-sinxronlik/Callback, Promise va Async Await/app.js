setTimeout(() => {
  console.log("Loading users...");

  setTimeout(() => {
    console.log("Loading posts...");

    setTimeout(() => {
      console.log("Done!");
    }, 1000);
  }, 1000);
}, 1000);

fetch("https://jsonplaceholder.typicode.com/users")
  .then((res) => res.json())
  .then((users) => {
    const firstUserId = users[0].id;
    return fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${firstUserId}`,
    );
  })
  .then((res) => res.json())
  .then((posts) => {
    const firstFiveTitles = posts.slice(0, 5).map((p) => p.title);
    console.log("First 5 post titles:", firstFiveTitles);
  })
  .catch((err) => {
    console.error("Xatolik yuz berdi:", err);
  });

const fetchUsers = () => Promise.resolve(["User1", "User2"]);
const fetchPosts = () => Promise.resolve(["Post1", "Post2", "Post3"]);
const fetchComments = () => Promise.resolve(["Comment1"]);

Promise.all([fetchUsers(), fetchPosts(), fetchComments()])
  .then(([users, posts, comments]) => {
    console.log("--- Parallel natijalar ---");
    console.log("Users:", users.length);
    console.log("Posts:", posts.length);
    console.log("Comments:", comments.length);
  })
  .catch((err) => console.error(err));
