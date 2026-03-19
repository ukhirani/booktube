import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col h-screen items-center justify-center ">
      <div className="text-8xl text-primary font-extrabold">404</div>
      <div className="text-2xl text-primary font-semibold ">Page Not Found</div>

      <Link to="/" className="link link-secondary mt-2!">
        Back to Home Page
      </Link>
    </div>
  );
};

export default NotFoundPage;
