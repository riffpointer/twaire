const Features = () => {
  return (
    <div className="container py-4">
      <h1 className="display-6 text-center text-primary fw-bold mb-4">
        Our Amazing Features
      </h1>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h2 className="h4 text-secondary mb-3">
          Seamless Video Uploads
          </h2>
          <p className="mb-3">
          Share your moments with the world! Our platform allows you to
          effortlessly upload your videos, whether they're short clips or longer
          productions. With support for various formats and intuitive controls,
          getting your content online has never been easier.
          </p>
          <ul className="list-group list-group-flush">
            <li className="list-group-item px-0">Fast and reliable upload speeds.</li>
            <li className="list-group-item px-0">Support for multiple video formats (MP4, AVI, MOV, etc.).</li>
            <li className="list-group-item px-0">Progress tracking for large files.</li>
            <li className="list-group-item px-0">Privacy settings to control who sees your content.</li>
          </ul>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h2 className="h4 text-secondary mb-3">
          Personalized Profile Customization
          </h2>
          <p className="mb-3">
          Make your profile truly yours! Express your unique style and
          personality with our extensive profile customization options. From
          choosing your avatar to designing your page layout, you have the power
          to create a space that reflects you.
          </p>
          <ul className="list-group list-group-flush">
            <li className="list-group-item px-0">Choose from a wide range of avatars and cover photos.</li>
            <li className="list-group-item px-0">Customize your profile theme and color scheme.</li>
            <li className="list-group-item px-0">Add a personalized bio to tell your story.</li>
            <li className="list-group-item px-0">Showcase your favorite videos and playlists.</li>
          </ul>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h2 className="h4 text-secondary mb-3">
          And Much More!
          </h2>
          <p className="mb-0">
          These are just a couple of the exciting features we offer. We are
          constantly working to improve your experience with new tools and
          functionalities. Stay tuned for more updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;
