import { Router } from "express";
import {Comment} from "../models/models.js";
import isAuthenticated from "../middleware/auth.js";

const commentsRouter = Router();

// POST API: Add a reply to a comment of specified ID
commentsRouter.post("/:id/replies", isAuthenticated, async (req, res) => {
    try {
        if (!req.session.userId)
            return res.status(401).json({ error: "Not logged in" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        comment.replies.push({
            user: req.session.userId,
            text: req.body.text,
        });

        await comment.save();
        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while trying to retrieve replies" });
    }
});

// POST API: Toggle liked status of a comment
commentsRouter.post("/:id/like", isAuthenticated, async (req, res) => {
    try {
        if (!req.session.userId)
            return res.status(401).json({ error: "Not logged in" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const userId = req.session.userId;

        // remove dislike if exists
        comment.dislikes = comment.dislikes.filter(
            (id) => id.toString() !== userId
        );

        // toggle like
        if (comment.likes.includes(userId)) {
            comment.likes = comment.likes.filter((id) => id.toString() !== userId);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while trying to process reactions (like)" });
    }
});

// POST API: Toggle disliked status of a comment
commentsRouter.post("/:id/dislike", isAuthenticated, async (req, res) => {
    try {
        if (!req.session.userId)
            return res.status(401).json({ error: "Not logged in" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const userId = req.session.userId;

        // remove like if exists
        comment.likes = comment.likes.filter((id) => id.toString() !== userId);

        // toggle dislike
        if (comment.dislikes.includes(userId)) {
            comment.dislikes = comment.dislikes.filter(
                (id) => id.toString() !== userId
            );
        } else {
            comment.dislikes.push(userId);
        }

        await comment.save();
        res.json({ likes: comment.likes.length, dislikes: comment.dislikes.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while trying to process reactions (dislike)" });
    }
});

export default commentsRouter;