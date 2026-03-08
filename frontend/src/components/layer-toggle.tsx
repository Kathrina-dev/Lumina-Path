export default function LayerToggle() {
  return (
    <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow">

      <p className="font-bold mb-2">Map Layers</p>

      <label className="block">
        <input type="checkbox" defaultChecked />
        Street Lighting
      </label>

      <label className="block">
        <input type="checkbox" />
        Open Stores
      </label>

      <label className="block">
        <input type="checkbox" />
        Safety Reports
      </label>

    </div>
  );
}