export default function SearchPanel() {
  return (
    <div className="absolute top-4 left-4 bg-white p-3 rounded shadow w-72">

      <input
        type="text"
        placeholder="Start location"
        className="w-full border p-2 mb-2"
      />

      <input
        type="text"
        placeholder="Destination"
        className="w-full border p-2"
      />

      <button className="mt-2 w-full bg-blue-500 text-white p-2 rounded">
        Find Safe Route
      </button>

    </div>
  );
}