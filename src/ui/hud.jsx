export default function HUD({ status }) {
  return (
    <div className="hud">
      <h1>J.A.R.V.I.S</h1>
      <p>{status}</p>
    </div>
  );
}
