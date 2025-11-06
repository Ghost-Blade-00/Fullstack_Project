import { Loader2 } from "lucide-react";

const Loading = ({ size = 24, text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-6">
      <Loader2 className="animate-spin text-primary mb-2" size={size} />
      <p className="text-sm text-neutral-500">{text}</p>
    </div>
  );
};

export default Loading;
