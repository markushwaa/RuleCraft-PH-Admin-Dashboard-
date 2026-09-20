import {
  FaTimes,
} from "react-icons/fa";


function UserModal({ isOpen, onClose }) {

  if (!isOpen) return null;


  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">


      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8">


        {/* Header */}

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold text-slate-800">
            Add New User
          </h2>


          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-500 transition"
          >

            <FaTimes />

          </button>


        </div>



        {/* Form */}

        <form className="space-y-5">


          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name
            </label>


            <input
              type="text"
              placeholder="Enter full name"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>



          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>


            <input
              type="email"
              placeholder="Enter email"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>



          <div className="grid grid-cols-2 gap-4">


            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Level
              </label>


              <input
                type="number"
                placeholder="Level"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>



            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                XP
              </label>


              <input
                type="number"
                placeholder="XP"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>


          </div>




          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status
            </label>


            <select
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >

              <option>
                Active
              </option>

              <option>
                Inactive
              </option>


            </select>


          </div>



          {/* Buttons */}

          <div className="flex justify-end gap-3 pt-4">


            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 transition"
            >

              Cancel

            </button>



            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >

              Save User

            </button>


          </div>


        </form>


      </div>


    </div>

  );

}


export default UserModal;