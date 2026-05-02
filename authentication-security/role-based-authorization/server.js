import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// DB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err.message));

// Post model
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

// Fake users
const users = {
  "user-token": {
    _id: "65f000000000000000000001",
    username: "Ali",
    role: "user",
  },
  "admin-token": {
    _id: "65f000000000000000000002",
    username: "Admin",
    role: "admin",
  },
};

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Token kerak" });
  }

  const user = users[token];

  if (!user) {
    return res.status(401).json({ error: "Token noto‘g‘ri" });
  }

  req.user = user;
  next();
}

// Role middleware
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Faqat admin uchun" });
    }

    next();
  };
}

// PUBLIC
app.get("/posts/public", async (req, res) => {
  const posts = await Post.find({ isPublic: true });
  res.json(posts);
});

// AUTH REQUIRED: create post
app.post("/posts", requireAuth, async (req, res) => {
  const { title, content, isPublic } = req.body;

  const post = await Post.create({
    title,
    content,
    isPublic,
    owner: req.user._id,
  });

  res.status(201).json(post);
});

// AUTH REQUIRED: my posts
app.get("/posts/me", requireAuth, async (req, res) => {
  const posts = await Post.find({
    owner: req.user._id,
  });

  res.json(posts);
});

// AUTH REQUIRED: update post
app.put("/posts/:id", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post topilmadi" });
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = post.owner.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: "Sizga ruxsat yo‘q owner emas" });
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedPost);
});

// AUTH REQUIRED: delete post
app.delete("/posts/:id", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post topilmadi" });
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = post.owner.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: "Sizga ruxsat yo‘q owner emas" });
  }

  await Post.findByIdAndDelete(req.params.id);

  res.json({ message: "Post o‘chirildi" });
});

// ADMIN ONLY: all posts
app.get("/posts", requireAuth, requireRole("admin"), async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// ADMIN ONLY: toggle public
app.patch(
  "/posts/:id/toggle-public",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post topilmadi" });
    }

    post.isPublic = !post.isPublic;
    await post.save();

    res.json(post);
  }
);

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});