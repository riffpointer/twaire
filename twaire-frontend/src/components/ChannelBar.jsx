import React from "react";
import SubscribeButton from "./SubscribeButton";
import VerifiedUserBadge from "./VerifiedUserBadge";
import { Link } from "react-router-dom";
import UserAvatar from "./UserAvatar.jsx";

function ChannelBar({ video, uploaderSubs, subscribed, subLoading, handleSubscribe }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <Link to={`/user/${video.uploader.username}`} className="text-decoration-none">
            <UserAvatar user={video.uploader} size={48} />
          </Link>

          <div>
            <Link
              to={`/user/${video.uploader.username}`}
              className="d-flex align-items-center gap-1 text-dark fw-bold text-decoration-none mb-0 h6"
            >
              {video.uploader.publicName}
              <VerifiedUserBadge user={video.uploader} verticalAlign="middle" />
            </Link>

            <div className="text-muted small">
              {uploaderSubs} subscriber{uploaderSubs === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div>
          <SubscribeButton
            subscribed={subscribed}
            subLoading={subLoading}
            handleSubscribe={handleSubscribe} 
          />
        </div>
      </div>
    </div>
  );
}

export default ChannelBar;