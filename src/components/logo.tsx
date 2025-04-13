export default function Logo() {
    return (
        <div className="flex items-center justify-center gap-1">
            <img
                src="/logo.png"
                alt="Logo"
                className="h-12 aspect-square object-cover rounded-full"
            />
            <p className="text-5xl m-auto">DataVision</p>
        </div>
    );
}