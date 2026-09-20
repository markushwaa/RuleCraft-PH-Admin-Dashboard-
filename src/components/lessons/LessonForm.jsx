import { useState } from "react";
import { FaUpload } from "react-icons/fa";

import { addLesson, updateLesson } from "../../services/lessonService";

function LessonForm({ lesson, onClose, onSuccess }) {

  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({

    title: lesson?.title || "",

    description: lesson?.description || "",

    category: lesson?.category || "",

    difficulty: lesson?.difficulty || "Beginner",

    status: lesson?.status || "Published",

  });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      if (lesson?.id) await updateLesson(lesson.id, formData, file, lesson);
      else await addLesson(formData, file);

      onSuccess();

      onClose();

    } catch (error) {

      console.error(error);

      alert("Failed to upload lesson.");

    }

    setLoading(false);

  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl w-full max-w-2xl p-8">

        <h2 className="text-2xl font-bold mb-6">

          {lesson ? "Edit Lesson" : "Add New Lesson"}

        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            name="title"
            placeholder="Lesson Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3"
          />

          <textarea
            name="description"
            placeholder="Lesson Description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-xl px-4 py-3"
          />

          <div className="grid grid-cols-3 gap-4">

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3"
            >
              <option value="">Category</option>
              <option>Traffic Signs</option>
              <option>Road Markings</option>
              <option>Traffic Laws</option>
              <option>Driving Basics</option>
              <option>Parking Rules</option>
            </select>

            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border rounded-xl px-4 py-3"
            >
              <option>Published</option>
              <option>Draft</option>
              <option>Archived</option>
            </select>

          </div>

          <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center cursor-pointer hover:border-blue-500">

            <FaUpload className="text-3xl text-blue-600 mb-3" />

            <p className="font-medium">

              Click to upload lesson file

            </p>

            <p className="text-sm text-slate-500">

              PDF, DOCX, PPTX, JPG, PNG

            </p>

            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
            />

          </label>

          {file && (

            <div className="rounded-xl bg-slate-100 p-3">

              Selected File:

              <strong className="ml-2">

                {file.name}

              </strong>

            </div>

          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border"
            >

              Cancel

            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl disabled:bg-blue-400"
            >

              {loading ? "Saving..." : "Save Lesson"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default LessonForm;
