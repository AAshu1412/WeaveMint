import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Footer() {
  return (
    <div className="w-full py-[2%] border-t border-gray-600/50 mt-7 flex items-center justify-center gap-10">
      <a
        href="https://github.com/AAshu1412"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3"
      >
        <Avatar className="transition-transform duration-200 ease-in-out transform hover:scale-125">
          <AvatarImage
            src="https://avatars.githubusercontent.com/u/132162510?v=4"
            alt="AAshu1412"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="text-sm">AAshu1412</h1>
      </a>

      <a
        href="https://github.com/mujahid002"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3"
      >
        <Avatar className="transition-transform duration-200 ease-in-out transform hover:scale-125">
          <AvatarImage
            src="https://avatars.githubusercontent.com/u/109784578?v=4"
            alt="mujahid002"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="text-sm">mujahid002</h1>
      </a>
    </div>
  );
}
