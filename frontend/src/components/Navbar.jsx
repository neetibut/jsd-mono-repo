import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav>
      <ul className="flex justify-end px-10 items-center w-full bg-teal-500 h-14 border-b-2 border-black gap-x-6 text-2xl text-white ">
        <li>
          <Link to="/" className="hover:text-yellow-500">
            Home
          </Link>
        </li>
        <li>
          <Link to="/owner" className="hover:text-yellow-500">
            Owner
          </Link>
        </li>
      </ul>
    </nav>
  );
}
