export default function RouteControls() {
  return (
    <div className="absolute top-4 right-4 bg-white p-3 rounded shadow">

      <p className="font-bold mb-2">Route Preference</p>

      <button className="block mb-1 w-full border p-2">
        Safest
      </button>

      <button className="block mb-1 w-full border p-2">
        Balanced
      </button>

      <button className="block w-full border p-2">
        Fastest
      </button>

    </div>
  );
}