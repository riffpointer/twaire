import { Router } from "express";
import { Comment, Video } from "../models/models.js";
import isAuthenticated from "../middleware/auth.js";

const commentsRouter = Router();

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const findCommentTarget = async (id) => {
    let comment = await Comment.findById(id);
    if (comment) {
        return { comment, target: comment, kind: "comment" };
    }

    comment = await Comment.findOne({ "replies._id": id });
    if (!comment) return null;

    const reply = comment.replies.id(id);
    if (!reply) return null;

    return { comment, target: reply, kind: "reply" };
};

// POST API: Add a reply to a comment of specified ID
commentsRouter.post("/:id/replies", isAuthenticated, async (req, res) => {
    try {
        if (!req.session.userId)
            return res.status(401).json({ error: "Not logged in" });

        const text = normalizeText(req.body.text);
        if (!text) return res.status(400).json({ error: "Reply text is required" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        comment.replies.push({
            user: req.session.userId,
            text,
        });

        await comment.save();
        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while trying to retrieve replies" });
    }
});

commentsRouter.put("/:id", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId?.toString();
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const text = normalizeText(req.body.text);
        if (!text) return res.status(400).json({ error: "Comment text is required" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ error: "You can only edit your own comments" });
        }

        comment.text = text;
        await comment.save();
        await comment.populate("user", "username publicName profilePicture verified");
        await comment.populate("replies.user", "username publicName profilePicture verified");

        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while editing comment" });
    }
});

commentsRouter.delete("/:id", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId?.toString();
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ error: "You can only delete your own comments" });
        }

        const video = await Video.findById(comment.video);
        if (video && video.pinnedCommentId?.toString() === comment._id.toString()) {
            video.pinnedCommentId = null;
            await video.save();
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.json({ success: true, id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while deleting comment" });
    }
});

commentsRouter.put("/:id/replies/:replyId", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId?.toString();
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const text = normalizeText(req.body.text);
        if (!text) return res.status(400).json({ error: "Reply text is required" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found" });
        if (reply.user.toString() !== userId) {
            return res.status(403).json({ error: "You can only edit your own replies" });
        }

        reply.text = text;
        await comment.save();
        await comment.populate("user", "username publicName profilePicture verified");
        await comment.populate("replies.user", "username publicName profilePicture verified");

        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while editing reply" });
    }
});

commentsRouter.delete("/:id/replies/:replyId", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId?.toString();
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found" });
        if (reply.user.toString() !== userId) {
            return res.status(403).json({ error: "You can only delete your own replies" });
        }

        reply.deleteOne();
        await comment.save();
        res.json({ success: true, id: req.params.replyId, commentId: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while deleting reply" });
    }
});

// POST API: Toggle liked status of a comment
commentsRouter.post("/:id/like", isAuthenticated, async (req, res) => {
    try {
        if (!req.session.userId)
            return res.status(401).json({ error: "Not logged in" });

        const found = await findCommentTarget(req.params.id);
        if (!found) return res.status(404).json({ error: "Comment not found" });

        const userId = req.session.userId;
        const target = found.target;

        // remove dislike if exists
        target.dislikes = target.dislikes.filter(
            (id) => id.toString() !== userId
        );

        // toggle like
        if (target.likes.some((id) => id.toString() === userId)) {
            target.likes = target.likes.filter((id) => id.toString() !== userId);
        } else {
            target.likes.push(userId);
        }

        await found.comment.save();
        res.json({ likes: target.likes.length, dislikes: target.dislikes.length });
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

        const found = await findCommentTarget(req.params.id);
        if (!found) return res.status(404).json({ error: "Comment not found" });

        const userId = req.session.userId;
        const target = found.target;

        // remove like if exists
        target.likes = target.likes.filter((id) => id.toString() !== userId);

        // toggle dislike
        if (target.dislikes.some((id) => id.toString() === userId)) {
            target.dislikes = target.dislikes.filter(
                (id) => id.toString() !== userId
            );
        } else {
            target.dislikes.push(userId);
        }

        await found.comment.save();
        res.json({ likes: target.likes.length, dislikes: target.dislikes.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while trying to process reactions (dislike)" });
    }
});

commentsRouter.post("/:id/pin", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId?.toString();
        if (!userId) return res.status(401).json({ error: "Not logged in" });

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const video = await Video.findById(comment.video);
        if (!video) return res.status(404).json({ error: "Video not found" });

        if (video.uploader.toString() !== userId) {
            return res.status(403).json({ error: "Only the video uploader can pin comments" });
        }

        video.pinnedCommentId = comment._id;
        await video.save();

        res.json({ pinnedCommentId: video.pinnedCommentId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error while pinning comment" });
    }
});

export default commentsRouter;
