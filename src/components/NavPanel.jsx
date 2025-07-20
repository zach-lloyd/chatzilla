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
            <div className="row" style={{ cursor: "pointer" }}>
              <div
                className={
                  selectedTab === "Rooms"
                    ? "col-6 border-dark-purple purple-haze"
                    : "col-6 border-dark-purple bg-white"
                }
              >
                <h3 onClick={() => setSelectedTab("Rooms")}>Rooms</h3>
              </div>
              <div
                className={
                  selectedTab !== "Rooms"
                    ? "col-6 border-dark-purple purple-haze"
                    : "col-6 border-dark-purple bg-white"
                }
              >
                <h3 onClick={() => setSelectedTab("Users")}>Users</h3>
              </div>
            </div>
            <div
              className="row"
              style={{
                cursor: "pointer",
                backgroundColor: "#402468",
              }}
            >
              <div className="col-12 border-dark-purple text-center text-white">
                {selectedTab === "Rooms" ? (
                  <>
                    <h5 onClick={() => setShowRoomModal(true)} className="m-0">
                      Create New Room
                    </h5>
                  </>
                ) : (
                  <>
                    <h5 onClick={togglePresence} className="m-0">
                      {user.presence ? "Disable Presence" : "Enable Presence"}
                    </h5>
                  </>
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
