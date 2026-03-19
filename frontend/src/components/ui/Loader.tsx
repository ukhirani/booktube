import type { SizeType } from "../../types/ui";

interface LoaderProps {
  size?: SizeType;
}

const Loader = ({ size = "md" }: LoaderProps) => {
  return <span className={`loading loading-spinner loading-${size}`}></span>;
};

export default Loader;
