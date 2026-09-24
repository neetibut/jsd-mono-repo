import { useState } from "react";

export function AdminTable({ users, setUsers, fetchUsers, API }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
    position: "",
    password: "",
  });

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "",
    position: "",
  });
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || "Failed to create user");
      }
      await fetchUsers();
      setForm({
        username: "",
        email: "",
        role: "",
        password: "",
        position: "",
      });
    } catch (error) {
      setFormError(error.message || "Failed to create user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return;
    setUsers(users.filter((user) => user._id !== id));
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      position: user.position,
    });
  };

  const handleEditSave = async (id) => {
    setFormError(null);
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || "Failed to update user");
      }
      await fetchUsers();
      setEditId(null);
    } catch (error) {
      setFormError(error.message || "Failed to update user");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  return (
    <div className="flex flex-col items-center">
      {formError && (
        <div className="w-full mb-2 px-4 py-2 bg-rose-100 text-rose-800 text-sm rounded border border-rose-300">
          {formError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="pb-3">
        <input
          onChange={handleChange}
          value={form.username}
          name="username"
          className="bg-white mx-1 w-32 px-2 rounded border"
          placeholder="Username"
          required
          minLength={3}
          maxLength={20}
        />
        <input
          onChange={handleChange}
          value={form.email}
          name="email"
          className="bg-white mx-1 w-64 px-2 rounded border"
          placeholder="Email"
          type="email"
          required
        />
        <select
          onChange={handleChange}
          value={form.role}
          name="role"
          className="bg-white mx-1 w-32 px-2 rounded border"
        >
          <option value="">Select role</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <input
          onChange={handleChange}
          value={form.password}
          name="password"
          className="bg-white mx-1 w-32 px-2 rounded border"
          placeholder="Password"
          type="password"
          required
          minLength={8}
          maxLength={72}
        />
        <input
          onChange={handleChange}
          value={form.position}
          name="position"
          className="bg-white mx-1 w-32 px-2 rounded border"
          placeholder="Position"
        />

        <button
          type="submit"
          className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 mx-1 rounded-4xl"
        >
          Save new user
        </button>
      </form>
      <table className="w-full border-separate">
        <thead>
          <tr className="text-center font-bold bg-gray-200">
            <th className="border rounded-tl-lg p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Position</th>
            <th className="border rounded-tr-lg p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="bg-white">
              {editId === user._id ? (
                <>
                  <td className="border p-2 ">
                    <input
                      value={editForm.username}
                      onChange={handleEditChange}
                      name="username"
                      className="bg-white w-24 px-2 rounded border"
                      required
                      minLength={3}
                      maxLength={20}
                    />
                  </td>
                  <td className="border p-2 ">
                    <input
                      value={editForm.email}
                      onChange={handleEditChange}
                      name="email"
                      className="bg-white w-full px-2 rounded border"
                      type="email"
                      required
                    />
                  </td>
                  <td className="border p-2 ">
                    <select
                      value={editForm.role}
                      onChange={handleEditChange}
                      name="role"
                      className="bg-white w-24 px-2 rounded border"
                    >
                      <option value="">Select role</option>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="border p-2 ">
                    <input
                      value={editForm.position}
                      onChange={handleEditChange}
                      name="position"
                      className="bg-white px-2 rounded border"
                    />
                  </td>
                  <td className="border p-2 flex justify-center gap-x-1 min-h-full">
                    <button
                      onClick={() => handleEditSave(user._id)}
                      className="cursor-pointer bg-teal-400 hover:bg-teal-500 text-white px-2 rounded-xl"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="cursor-pointer bg-gray-400 hover:bg-gray-500 text-white px-2 rounded-xl"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2 ">{user.username}</td>
                  <td className="border p-2 ">{user.email}</td>
                  <td className="border p-2 ">{user.role}</td>
                  <td className="border p-2 ">{user.position}</td>
                  <td className="border p-2 flex justify-center gap-x-1">
                    <button
                      onClick={() => handleEdit(user)}
                      className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white px-2 rounded-xl"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="cursor-pointer bg-rose-400 hover:bg-rose-500 text-white px-2 rounded-xl"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
