import ReactDOM from "react-dom";

export default function Modal({ children, onClose }) {
  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}   // don’t close when clicking inside
        style={{
          background: "#fff",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          minWidth: "min(28rem, 90%)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 30px rgba(0,0,0,.25)",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}