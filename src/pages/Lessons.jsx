import { useEffect, useState } from "react";
import LessonForm from "../components/lessons/LessonForm";
import {
  getLessons,
  deleteLesson,
} from "../services/lessonService";
import {
  FaPlus,
  FaTrash,
  FaDownload,
  FaBook,
  FaCheckCircle,
  FaClock,
  FaArchive,
  FaSearch,
  FaEdit,
} from "react-icons/fa";
function Lessons() {

  const [lessons, setLessons] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
const [search, setSearch] = useState("");
  const loadLessons = async () => {
    const data = await getLessons();
    setLessons(data);
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleDelete = async (lesson) => {

    const confirmDelete = window.confirm(
      `Delete "${lesson.title}"?`
    );

    if (!confirmDelete) return;

    await deleteLesson(lesson);

    loadLessons();
  };

  const filteredLessons = lessons.filter((lesson) => {

  const keyword = search.toLowerCase();

  return (
    lesson.title?.toLowerCase().includes(keyword) ||
    lesson.category?.toLowerCase().includes(keyword)
  );

});
  return (

    <div className="space-y-6">

     {/* Header */}

<div className="flex items-center justify-between">

  <div>

    <h1 className="text-3xl font-bold text-slate-800">
      Lesson Management
    </h1>

    <p className="text-slate-500 mt-2">
      Upload and manage learning materials.
    </p>

  </div>

  <button
    onClick={() => {
      setEditingLesson(null);
      setShowModal(true);
    }}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
  >
    <FaPlus />

    Add Lesson

  </button>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

  <div className="bg-white rounded-2xl border shadow-sm p-5 flex justify-between items-center">

    <div>

      <p className="text-slate-500">Total Lessons</p>

      <h2 className="text-3xl font-bold">
        {lessons.length}
      </h2>

    </div>

    <FaBook className="text-4xl text-blue-600"/>

  </div>

  <div className="bg-white rounded-2xl border shadow-sm p-5 flex justify-between items-center">

    <div>

      <p className="text-slate-500">Published</p>

      <h2 className="text-3xl font-bold">
        {lessons.filter(l => l.status==="Published").length}
      </h2>

    </div>

    <FaCheckCircle className="text-4xl text-green-600"/>

  </div>

  <div className="bg-white rounded-2xl border shadow-sm p-5 flex justify-between items-center">

    <div>

      <p className="text-slate-500">Draft</p>

      <h2 className="text-3xl font-bold">
        {lessons.filter(l => l.status==="Draft").length}
      </h2>

    </div>

    <FaClock className="text-4xl text-yellow-500"/>

  </div>

  <div className="bg-white rounded-2xl border shadow-sm p-5 flex justify-between items-center">

    <div>

      <p className="text-slate-500">Archived</p>

      <h2 className="text-3xl font-bold">
        {lessons.filter(l => l.status==="Archived").length}
      </h2>

    </div>

    <FaArchive className="text-4xl text-red-600"/>

  </div>

</div>

<div className="relative max-w-md">

  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

  <input
    type="text"
    placeholder="Search lessons..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    className="w-full rounded-xl border py-3 pl-12 pr-4"
  />

</div>
      {/* Table */}

      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="text-left px-6 py-4">
                Title
              </th>

              <th className="text-left px-6 py-4">
                Category
              </th>

              <th className="text-left px-6 py-4">
                Difficulty
              </th>

              <th className="text-left px-6 py-4">
                Status
              </th>

              <th className="text-left px-6 py-4">
                File
              </th>

              <th className="text-center px-6 py-4">
                Actions
                
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredLessons.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center py-10 text-slate-500"
                >

                  No lessons available.

                </td>

              </tr>

            ) : (

              filteredLessons.map((lesson) => (

                <tr
                  key={lesson.id}
                  className="border-t"
                >

                  <td className="px-6 py-4">

                    {lesson.title}

                  </td>

                  <td className="px-6 py-4">

                    {lesson.category}

                  </td>

                  <td className="px-6 py-4">

                    {lesson.difficulty}

                  </td>

                  <td className="px-6 py-4">

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                      {lesson.status}

                    </span>

                  </td>

                  <td className="px-6 py-4">

                    {lesson.fileName || "-"}

                  </td>

                  <td className="px-6 py-4">

                    <div className="flex justify-center gap-3">

                      {lesson.fileURL && (

                        <a
                          href={lesson.fileURL}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >

                          <FaDownload />

                        </a>

                      )}

                      <button
                        onClick={() => handleDelete(lesson)}
                        className="text-red-600 hover:text-red-700"
                      >
                        

                        <FaTrash />

                      </button>
<button
  onClick={() => {
    setEditingLesson(lesson);
    setShowModal(true);
  }}
  className="text-amber-600 hover:text-amber-700"
>
  <FaEdit />
</button>
                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {showModal && (

       <LessonForm
  lesson={editingLesson}
  onClose={() => {
    setShowModal(false);
    setEditingLesson(null);
  }}
  onSuccess={loadLessons}
/>

      )}

    </div>

  );

}

export default Lessons;