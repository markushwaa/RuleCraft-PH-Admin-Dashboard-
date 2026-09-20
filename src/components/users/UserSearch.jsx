import {
  FaSearch,
} from "react-icons/fa";


function UserSearch() {

  return (

    <div className="relative w-full md:w-96">

      <FaSearch
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        placeholder="Search users..."
        className="w-full border border-slate-300 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
      />

    </div>

  );

}


export default UserSearch;