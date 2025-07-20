import { useContext, useState } from "react";
import { MessengerContext } from "./MessengerContext";
import DefaultImage from "../assets/default-image.png";
import ItemList from "./ItemList.jsx";
import CreateRoomForm from "./CreateRoomForm.jsx";
import RightArrow from "../assets/right-arrow-green.png";
import LeftArrow from "../assets/left-arrow-green.png";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Modal } from "react-bootstrap";

function NavPanel() {
  const { user, togglePresence } = useContext(MessengerContext);

  const [selectedTab, setSelectedTab] = useState("Rooms");
  const [hidden, setHidden] = useState(true);
  const [showRoomModal, setShowRoomModal] = useState(false);

  console.log("selected: ", selectedTab);

  return (
    <div
      style={{ backgroundColor: hidden ? "#1f0131" : "#402468", zIndex: 1100 }}
    >
      <button
        type="button"
        onClick={() => setHidden(!hidden)}
        aria-label={hidden ? "Open navigation panel" : "Close navigation panel"}
        style={{
          position: "fixed",
          zIndex: 2000,
          cursor: "pointer",
          width: "50px",
          padding: 0,
          border: "none",
          background: "transparent",
        }}
      >
        <img
          src={hidden ? RightArrow : LeftArrow}
          alt=""
          style={{ width: "100%" }}
        />
      </button>

      <Offcanvas
        show={!hidden}
        onHide={() => setHidden(!hidden)}
        placement="start" /* slide in from the left */
        backdrop={false} /* keep underlying page clickable */
        scroll /* body scroll stays enabled */
      >
        <Offcanvas.Header className="pb-0 mt-5">
          <Offcanvas.Title className="d-flex justify-content-center">
            <img
              src={DefaultImage}
              alt="The user's avatar"
              width="100px"
              className="rounded-circle me-2"
            />
            <h3 className="text-center align-self-center">
              <strong>{user.username}</strong>
            </h3>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="px-4">
          <div className="container">
            <div className="row" role="tablist">
              <div
                className={
                  selectedTab === "Rooms"
                    ? "col-6 border-dark-purple purple-haze"
                    : "col-6 border-dark-purple bg-white"
                }
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTab === "Rooms"}
                  className="btn btn-link w-100 p-2 m-0 text-decoration-none"
                  style={{
                    fontSize: "1.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedTab("Rooms")}
                >
                  Rooms
                </button>
              </div>
              <div
                className={
                  selectedTab !== "Rooms"
                    ? "col-6 border-dark-purple purple-haze"
                    : "col-6 border-dark-purple bg-white"
                }
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTab !== "Rooms"}
                  className="btn btn-link w-100 p-2 m-0 text-decoration-none"
                  style={{ fontSize: "1.75rem", cursor: "pointer" }}
                  onClick={() => setSelectedTab("Users")}
                >
                  Users
                </button>
              </div>
            </div>
            <div className="row" style={{ backgroundColor: "#402468" }}>
              <div className="col-12 border-dark-purple text-center text-white">
                {selectedTab === "Rooms" ? (
                  <button
                    type="button"
                    className="btn btn-link text-white p-2 m-0"
                    onClick={() => setShowRoomModal(true)}
                    style={{
                      fontSize: "1.25rem",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    Create New Room
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-link text-white p-2 m-0"
                    onClick={togglePresence}
                    style={{
                      fontSize: "1.25rem",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    {user.presence ? "Disable Presence" : "Enable Presence"}
                  </button>
                )}
              </div>
            </div>
            <div className="row border-dark-purple">
              <div className="col-12 p-0">
                {selectedTab === "Rooms" ? (
                  <ItemList type={"rooms"} />
                ) : (
                  <ItemList type={"users"} />
                )}
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
      <Modal
        show={showRoomModal}
        onHide={() => setShowRoomModal(false)}
        backdrop
        className="d-flex min-vh-100 justify-content-center align-items-center"
        dialogClassName="w-75"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create a Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateRoomForm
            onClose={() => setShowRoomModal(false)}
            hidePanel={() => setHidden(true)}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default NavPanel;
