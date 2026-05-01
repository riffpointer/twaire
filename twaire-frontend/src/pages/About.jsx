import { useEffect, useState } from "react";
import { ContentContainer } from "@/components/Containers.jsx";
import Footer from "@/components/Footer.jsx";
import ApiConfig from "../utils/ApiConfig.js";

const iconMap = {
  upload: "bi-cloud-upload",
  playback: "bi-play-circle",
  analytics: "bi-bar-chart",
  sort: "bi-sort-down",
  comments: "bi-chat-dots",
  like: "bi-hand-thumbs-up",
  web: "bi-globe2",
  server: "bi-hdd-network",
  database: "bi-database",
};

function FeatureIcon({ name }) {
  return <i className={`bi ${iconMap[name]} fs-6`} aria-hidden="true" />;
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-3">
      <h2 className="h5 fw-bold mb-1">{title}</h2>
      {description ? <p className="text-body-secondary mb-0">{description}</p> : null}
    </div>
  );
}

function FeatureCards() {
  const features = [
    {
      title: "Upload videos",
      desc: "Upload your own videos with custom thumbnails.",
      icon: <FeatureIcon name="upload" />,
    },
    {
      title: "Responsive player",
      desc: "Watch videos with a clean, responsive playback experience.",
      icon: <FeatureIcon name="playback" />,
    },
    {
      title: "View tracking",
      desc: "Automatic view counting and performance visibility.",
      icon: <FeatureIcon name="analytics" />,
    },
    {
      title: "Sorting options",
      desc: "Browse uploads by trending or recent activity.",
      icon: <FeatureIcon name="sort" />,
    },
    {
      title: "Reactions",
      desc: "Like and dislike videos to express feedback.",
      icon: <FeatureIcon name="like" />,
    },
    {
      title: "Comments",
      desc: "Join discussions with threaded replies and interactions.",
      icon: <FeatureIcon name="comments" />,
    },
  ];

  return (
    <div className="row g-3">
      {features.map((feature) => (
        <div key={feature.title} className="col-12 col-sm-6 col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="rounded-circle bg-body-tertiary text-primary d-grid align-items-center justify-content-center mb-3"
                style={{ width: 40, height: 40 }}>
                {feature.icon}
              </div>
              <h3 className="h6 fw-bold mb-1">{feature.title}</h3>
              <p className="text-body-secondary mb-0">{feature.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TechStack() {
  const stacks = [
    {
      label: "Frontend",
      icon: <FeatureIcon name="web" />,
      items: [
        { name: "React (Vite)", url: "https://react.dev/" },
        { name: "MUI", url: "https://mui.com/" },
        { name: "React Router", url: "https://reactrouter.com/" },
        { name: "Bootstrap", url: "https://getbootstrap.com/" },
      ],
    },
    {
      label: "Backend",
      icon: <FeatureIcon name="server" />,
      items: [
        { name: "Node.js", url: "https://nodejs.org/" },
        { name: "Express", url: "https://expressjs.com/" },
        { name: "Multer", url: "https://github.com/expressjs/multer" },
      ],
    },
    {
      label: "Database",
      icon: <FeatureIcon name="database" />,
      items: [
        { name: "MongoDB", url: "https://www.mongodb.com/" },
        { name: "Mongoose", url: "https://mongoosejs.com/" },
      ],
    },
  ];

  return (
    <div className="row g-3">
      {stacks.map((stack) => (
        <div key={stack.label} className="col-12 col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="rounded-circle bg-body-tertiary text-primary d-grid align-items-center justify-content-center"
                  style={{ width: 30, height: 30 }}>
                  {stack.icon}
                </div>
                <h3 className="h6 fw-bold mb-0">{stack.label}</h3>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {stack.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge rounded-pill text-bg-light text-decoration-none border"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function About() {
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    document.title = "About - Twaire";
  }, []);

  return (
    <>
      <div className="w-100 mb-4" style={{ marginTop: "-1.5rem" }}>
        {!bannerLoaded && <Skeleton variant="rectangular" width="100%" height={320} />}
        <img
          src={`${ApiConfig.serverUrl}/res/branding/TwaireBannerFront.png`}
          alt="Twaire banner"
          className="img-fluid w-100"
          style={{ display: bannerLoaded ? "block" : "none" }}
          onLoad={() => setBannerLoaded(true)}
        />
      </div>

      <ContentContainer>
        <div className="card border-0 shadow-sm rounded-4 mb-3">
          <div className="card-body p-4 p-md-5">
            <h1 className="h3 fw-bold mb-2">About Twaire</h1>
            <p className="text-body-secondary mb-0" style={{ maxWidth: 760 }}>
            Twaire is a lightweight, open-source video sharing platform built with React, Node.js, Express, and
            MongoDB. Upload videos, discover content, and engage with comments in a straightforward, fast interface.
            </p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-3">
          <div className="card-body p-4">
          <SectionHeader
            title="Features"
            description="The core capabilities currently available in Twaire."
          />
          <FeatureCards />
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-3">
          <div className="card-body p-4">
          <SectionHeader
            title="Tech Stack"
            description="Main frontend, backend, and data technologies used in production."
          />
          <TechStack />
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-3">
          <div className="card-body p-4">
          <SectionHeader title="Author" />
          <div className="card border-0 rounded-4 bg-body-tertiary">
            <div className="card-body d-flex align-items-center gap-3">
              <img src="https://placehold.co/128" alt="theonlyasdk" className="rounded-circle" width="50" height="50" />
              <div>
                <p className="fw-bold mb-1">theonlyasdk</p>
                <p className="text-body-secondary mb-0">
                  Twaire is primarily developed and maintained by{" "}
                  <a href="https://github.com/theonlyasdk" target="_blank" rel="noopener noreferrer" className="link-underline link-underline-opacity-0">
                    theonlyasdk
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-5">
          <div className="card-body p-4">
          <SectionHeader title="License" />
          <hr className="my-3" />
          <p className="text-body-secondary mb-0">
            <strong>Twaire</strong> is open source software licensed under the{" "}
            <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="link-underline link-underline-opacity-0">
              MIT License
            </a>
            . The source code is available on{" "}
            <a href="https://github.com/theonlyasdk/twaire" target="_blank" rel="noopener noreferrer" className="link-underline link-underline-opacity-0">
              GitHub
            </a>
            .
          </p>
          </div>
        </div>
      </ContentContainer>

      <Footer />
    </>
  );
}

export default About;
