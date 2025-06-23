// pages/index.tsx (login screen)
import Link from "next/link";

const Home = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-900">
      <div className="max-w-md w-full p-4 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-200 text-center mb-4">
          Welcome to Chat App
        </h1>
        <Link href="/chat">
          <button className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded-lg w-full mb-4 border border-gray-600 cursor-pointer">
            Go to Chat Page
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
